import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return new Response("No active cycle", { status: 400 });

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

  const rows = ["Name,Email,Department,Manager,Goal Title,Weightage,Target,Q1 Score,Q2 Score,Q3 Score,Q4 Score,Avg Score"];

  for (const user of users) {
    for (const goal of user.goals) {
      const q1: number | string = goal.achievements.find((a) => a.quarter === "Q1")?.progressScore ?? "";
      const q2: number | string = goal.achievements.find((a) => a.quarter === "Q2")?.progressScore ?? "";
      const q3: number | string = goal.achievements.find((a) => a.quarter === "Q3")?.progressScore ?? "";
      const q4: number | string = goal.achievements.find((a) => a.quarter === "Q4")?.progressScore ?? "";
      const scores: number[] = ([q1, q2, q3, q4] as (number | string)[]).filter((s): s is number => s !== "");
      const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "";

      rows.push(
        [
          `"${user.name}"`,
          user.email,
          user.department || "",
          user.manager?.name || "",
          `"${goal.title}"`,
          goal.weightage,
          goal.target,
          q1, q2, q3, q4, avg,
        ].join(",")
      );
    }
  }

  const csv = rows.join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="atomquest-report-${activeCycle.name}.csv"`,
    },
  });
}
