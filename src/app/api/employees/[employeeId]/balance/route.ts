import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    const { employeeId } = params;
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

    return NextResponse.json(balance);
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    return NextResponse.json({ error: "Failed to fetch leave balance" }, { status: 500 });
  }
}
