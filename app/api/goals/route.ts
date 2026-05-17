import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema, validateGoalSet } from "@/lib/validations/goal";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return NextResponse.json({ goals: [] });

  let whereClause: any = { cycleId: activeCycle.id };
  
  if (session.user.role === "EMPLOYEE") {
    whereClause.userId = session.user.id;
  } else if (session.user.role === "MANAGER") {
    const reports = await prisma.user.findMany({
      where: { managerId: session.user.id },
      select: { id: true },
    });
    whereClause.userId = { in: reports.map((r) => r.id) };
  }
  // ADMIN sees all

  const goals = await prisma.goal.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true, department: true } },
      achievements: true,
      cycle: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "EMPLOYEE" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only employees can create goals" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) {
    return NextResponse.json({ error: "No active goal cycle" }, { status: 400 });
  }

  try {
    await validateGoalSet(session.user.id, activeCycle.id, parsed.data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      cycleId: activeCycle.id,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ goal }, { status: 201 });
}
