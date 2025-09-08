import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveBusinessRulesService } from "@/lib/leave-business-rules";
import { LeaveStatus, LeaveType } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leaveId: string }> }
) {
  try {
    const { leaveId } = await params;
    const body = await request.json();
    const { status, approverId } = body;

    if (!Object.values(LeaveStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Verify approver has permission
    const leave = await prisma.leave.findUnique({
      where: { leaveId },
      include: {
        employee: {
          select: { managerId: true },
        },
      },
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    if (leave.employee.managerId !== approverId) {
      return NextResponse.json(
        { error: "Approver not authorized for this leave" },
        { status: 403 }
      );
    }

    // Update the leave status
    const updatedLeave = await prisma.leave.update({
      where: { leaveId },
      data: {
        status,
        approverId: status === LeaveStatus.APPROVED ? approverId : leave.approverId,
      },
      include: {
        employee: {
          select: { employeeId: true, name: true },
        },
        approver: {
          select: { employeeId: true, name: true },
        },
      },
    });

    // If approved, update special leave usage tracking
    if (
      status === LeaveStatus.APPROVED &&
      leave.leaveType === LeaveType.SPECIAL &&
      leave.specialLeaveType
    ) {
      const currentYear = leave.startOfLeave.getFullYear();
      const employee = await prisma.employee.findUnique({
        where: { employeeId: leave.employeeId },
        select: { contractHours: true },
      });

      if (employee) {
        const limits = LeaveBusinessRulesService.getSpecialLeaveLimit(
          leave.specialLeaveType,
          employee.contractHours
        );

        // Update or create special leave usage record
        await prisma.specialLeaveUsage.upsert({
          where: {
            employeeId_year_specialLeaveType: {
              employeeId: leave.employeeId,
              year: currentYear,
              specialLeaveType: leave.specialLeaveType,
            },
          },
          update: {
            usedHours: {
              increment: leave.totalHours,
            },
            usedDays: {
              increment: Math.ceil(leave.totalHours / 8),
            },
          },
          create: {
            employeeId: leave.employeeId,
            year: currentYear,
            specialLeaveType: leave.specialLeaveType,
            usedHours: leave.totalHours,
            usedDays: Math.ceil(leave.totalHours / 8),
            maxHours: limits.maxHours,
            maxDays: limits.maxDays,
          },
        });
      }
    }

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json({ error: "Failed to update leave status" }, { status: 500 });
  }
}
