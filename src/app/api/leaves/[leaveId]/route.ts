import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeaveStatus } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { leaveId: string } }
) {
  try {
    const { leaveId } = params;
    const body = await request.json();
    const { employeeId } = body;

    const leave = await prisma.leave.findUnique({
      where: { leaveId },
    });

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave not found' },
        { status: 404 }
      );
    }

    if (leave.employeeId !== employeeId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this leave' },
        { status: 403 }
      );
    }

    if (leave.startOfLeave <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot delete leave that has started or passed' },
        { status: 400 }
      );
    }

    if (leave.status === LeaveStatus.APPROVED) {
      return NextResponse.json(
        {
          error: 'Cannot delete an approved leave. Please contact your manager to cancel it.',
        },
        { status: 400 }
      );
    }

    await prisma.leave.delete({
      where: { leaveId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting leave:', error);
    return NextResponse.json(
      { error: 'Failed to delete leave' },
      { status: 500 }
    );
  }
}
