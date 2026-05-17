import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return NextResponse.json({ report: [] });

  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: {
      goals: {
        where: { cycleId: activeCycle.id, status: "LOCKED" },
        include: { achievements: true },
      },
      manager: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const report = users.map((user) => {
    const goals = user.goals;
    const avgScore = goals.length
      ? goals.reduce((sum, g) => {
          const scores = g.achievements.map((a) => a.progressScore ?? 0);
          const avgGoalScore = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
          return sum + avgGoalScore * (g.weightage / 100);
        }, 0)
      : 0;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      manager: user.manager?.name,
      totalGoals: goals.length,
      avgProgressScore: Math.round(avgScore),
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        weightage: g.weightage,
        q1: g.achievements.find((a) => a.quarter === "Q1")?.progressScore ?? null,
        q2: g.achievements.find((a) => a.quarter === "Q2")?.progressScore ?? null,
        q3: g.achievements.find((a) => a.quarter === "Q3")?.progressScore ?? null,
        q4: g.achievements.find((a) => a.quarter === "Q4")?.progressScore ?? null,
      })),
    };
  });

  return NextResponse.json({ report, cycle: activeCycle });
}
