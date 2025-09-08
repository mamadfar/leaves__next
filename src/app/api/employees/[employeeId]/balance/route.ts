import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaveStatus, LeaveType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get("year") || new Date().getFullYear().toString());

    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId,
          year,
        },
      },
    });

    if (!balance) {
      return NextResponse.json({ error: "Leave balance not found for this year" }, { status: 404 });
    }

    // Calculate actual used hours from approved regular leaves
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
        status: LeaveStatus.APPROVED,
        leaveType: LeaveType.REGULAR,
        startOfLeave: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    const actualUsedHours = approvedLeaves.reduce((total, leave) => total + leave.totalHours, 0);
    const actualUsedDays = Math.ceil(actualUsedHours / 8);

    // Return balance with calculated used values
    const calculatedBalance = {
      ...balance,
      usedHours: actualUsedHours,
      usedDays: actualUsedDays,
    };

    return NextResponse.json(calculatedBalance);
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    return NextResponse.json({ error: "Failed to fetch leave balance" }, { status: 500 });
  }
}
