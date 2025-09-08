import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ managerId: string }> }
) {
  try {
    const { managerId } = await params;

    // Get subordinates
    const subordinates = await prisma.employee.findMany({
      where: { managerId },
      select: { employeeId: true },
    });

    const subordinateIds = subordinates.map((sub) => sub.employeeId);

    if (subordinateIds.length === 0) {
      return NextResponse.json([]);
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: { in: subordinateIds } },
      include: {
        employee: {
          select: {
            employeeId: true,
            name: true,
          },
        },
        approver: {
          select: {
            employeeId: true,
            name: true,
          },
        },
      },
      orderBy: { startOfLeave: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Error fetching manager leaves:", error);
    return NextResponse.json({ error: "Failed to fetch manager leaves" }, { status: 500 });
  }
}
