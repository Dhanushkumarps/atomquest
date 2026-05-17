import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return NextResponse.json({ data: [] });

  const statusCounts = await prisma.goal.groupBy({
    by: ["status"],
    where: { cycleId: activeCycle.id },
    _count: { status: true },
  });

  const data = statusCounts.map((s) => ({
    name: s.status,
    value: s._count.status,
  }));

  return NextResponse.json({ data });
}
