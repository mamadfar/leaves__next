import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { employeeId } = params;

    const leaves = await prisma.leave.findMany({
      where: { employeeId },
      include: {
        approver: {
          select: {
            employeeId: true,
            name: true,
          },
        },
      },
      orderBy: { startOfLeave: 'desc' },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error('Error fetching employee leaves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee leaves' },
      { status: 500 }
    );
  }
}
