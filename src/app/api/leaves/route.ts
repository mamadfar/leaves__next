import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeaveBusinessRulesService } from '@/lib/leave-business-rules';
import { LeaveStatus, LeaveType, SpecialLeaveType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leaveLabel,
      employeeId,
      startOfLeave,
      endOfLeave,
      leaveType = LeaveType.REGULAR,
      specialLeaveType,
    } = body;

    if (!leaveLabel || !employeeId || !startOfLeave || !endOfLeave) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const startDate = new Date(startOfLeave);
    const endDate = new Date(endOfLeave);

    // Get employee information
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      select: { managerId: true, contractHours: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Validate business rules
    const validation = LeaveBusinessRulesService.validateLeaveRequest({
      startOfLeave: startDate,
      endOfLeave: endDate,
      leaveType,
      specialLeaveType,
      employeeId,
      contractHours: employee.contractHours,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Leave request violates business rules',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check for overlapping leaves
    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        OR: [
          {
            AND: [
              { startOfLeave: { lte: startDate } },
              { endOfLeave: { gte: startDate } }
            ],
          },
          {
            AND: [
              { startOfLeave: { lte: endDate } },
              { endOfLeave: { gte: endDate } }
            ],
          },
          {
            AND: [
              { startOfLeave: { gte: startDate } },
              { endOfLeave: { lte: endDate } }
            ],
          },
        ],
        status: { notIn: [LeaveStatus.REJECTED, LeaveStatus.CANCELLED, LeaveStatus.CLOSED] },
      },
    });

    if (overlappingLeaves.length > 0) {
      return NextResponse.json(
        { error: 'Overlapping leave exists' },
        { status: 409 }
      );
    }

    // Calculate total hours for the leave
    const totalHours = LeaveBusinessRulesService.calculateWorkingHours(startDate, endDate);

    // For special leaves, check against usage limits
    if (leaveType === LeaveType.SPECIAL && specialLeaveType) {
      const currentYear = startDate.getFullYear();
      const limits = LeaveBusinessRulesService.getSpecialLeaveLimit(
        specialLeaveType,
        employee.contractHours,
      );

      // Get current usage
      const currentUsage = await prisma.specialLeaveUsage.findUnique({
        where: {
          employeeId_year_specialLeaveType: {
            employeeId,
            year: currentYear,
            specialLeaveType,
          },
        },
      });

      const currentUsedHours = currentUsage?.usedHours || 0;
      if (currentUsedHours + totalHours > limits.maxHours) {
        return NextResponse.json(
          {
            error: `Special leave limit exceeded. Maximum ${limits.maxHours} hours allowed for ${specialLeaveType}`,
          },
          { status: 400 }
        );
      }
    }

    // Check regular leave balance
    if (leaveType === LeaveType.REGULAR) {
      const currentYear = startDate.getFullYear();
      const leaveBalance = await prisma.leaveBalance.findUnique({
        where: { employeeId_year: { employeeId, year: currentYear } },
      });

      if (!leaveBalance) {
        return NextResponse.json(
          { error: 'Leave balance not found for current year' },
          { status: 400 }
        );
      }

      // Calculate current used hours from approved leaves
      const approvedLeaves = await prisma.leave.findMany({
        where: {
          employeeId,
          status: LeaveStatus.APPROVED,
          leaveType: LeaveType.REGULAR,
          startOfLeave: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1),
          },
        },
      });

      const currentUsedHours = approvedLeaves.reduce(
        (total, leave) => total + leave.totalHours,
        0,
      );

      if (currentUsedHours + totalHours > leaveBalance.totalHours) {
        return NextResponse.json(
          {
            error: 'Insufficient leave balance',
            details: {
              requested: totalHours,
              available: leaveBalance.totalHours - currentUsedHours,
              total: leaveBalance.totalHours,
            },
          },
          { status: 400 }
        );
      }
    }

    // Create the leave
    const leave = await prisma.leave.create({
      data: {
        leaveLabel,
        employeeId,
        startOfLeave: startDate,
        endOfLeave: endDate,
        approverId: employee.managerId || null,
        leaveType,
        specialLeaveType,
        totalHours,
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

    // Return warnings if any
    const response: any = { leave };
    if (validation.warnings.length > 0) {
      response.warnings = validation.warnings;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating leave:', error);
    return NextResponse.json(
      { error: 'Failed to create leave' },
      { status: 500 }
    );
  }
}
