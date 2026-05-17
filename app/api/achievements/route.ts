import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgressScore } from "@/lib/score-engine";
import { getActiveWindow, activeWindowToQuarter } from "@/lib/cycle-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let whereClause: any = {};
  if (session.user.role === "EMPLOYEE") {
    whereClause = { goal: { userId: session.user.id } };
  }

  const achievements = await prisma.achievement.findMany({
    where: whereClause,
    include: {
      goal: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ achievements });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { goalId, actual, status, notes } = body;

  if (!goalId) return NextResponse.json({ error: "goalId is required" }, { status: 400 });

  // Check active cycle and window
  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });

  const window = getActiveWindow(activeCycle);
  const quarter = activeWindowToQuarter(window);
  if (!quarter) {
    return NextResponse.json({ error: `Achievement tracking is not open (current: ${window})` }, { status: 400 });
  }

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const progressScore = actual !== undefined && actual !== null
    ? computeProgressScore(goal.uom as any, goal.target, actual)
    : null;

  const achievement = await prisma.achievement.upsert({
    where: { goalId_quarter: { goalId, quarter } },
    create: { goalId, quarter, actual, status: status || "ON_TRACK", progressScore, notes },
    update: { actual, status: status || "ON_TRACK", progressScore, notes },
  });

  return NextResponse.json({ achievement });
}
