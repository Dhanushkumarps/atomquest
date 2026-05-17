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

  const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
  const data = await Promise.all(
    quarters.map(async (quarter) => {
      const achievements = await prisma.achievement.findMany({
        where: { quarter, goal: { cycleId: activeCycle.id, status: "LOCKED" } },
      });

      const scores = achievements
        .filter((a) => a.progressScore !== null)
        .map((a) => a.progressScore as number);

      const avgScore = scores.length
        ? scores.reduce((s, v) => s + v, 0) / scores.length
        : 0;

      const total = await prisma.goal.count({
        where: { cycleId: activeCycle.id, status: "LOCKED" },
      });
      const completed = achievements.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        quarter,
        avgScore: Math.round(avgScore),
        completionRate: Math.round(completionRate),
      };
    })
  );

  return NextResponse.json({ data });
}
