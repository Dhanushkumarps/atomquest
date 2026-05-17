// Server-only validation helpers (DB calls). No "use server" directive because
// we also export the Zod schema (which is not an async function).
// API routes import from here; Client Components import from goal-schema.ts.

export { goalSchema, type GoalInput } from "./goal-schema";

import { prisma } from "@/lib/prisma";

export async function validateGoalSet(
  userId: string,
  cycleId: string,
  newGoal: { weightage: number },
  excludeGoalId?: string
) {
  const existingGoals = await prisma.goal.findMany({
    where: {
      userId,
      cycleId,
      status: { not: "REWORK" },
      id: { not: excludeGoalId },
    },
  });

  if (existingGoals.length >= 8) {
    throw new Error("Maximum 8 goals per employee per cycle");
  }

  const totalWeightage =
    existingGoals.reduce((sum, g) => sum + g.weightage, 0) + newGoal.weightage;
  if (totalWeightage > 100) {
    throw new Error(
      `Total weightage would be ${totalWeightage.toFixed(1)}%. Must not exceed 100%.`
    );
  }
}

export function validateFinalSubmission(goals: { weightage: number }[]) {
  const total = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(
      `Total weightage is ${total.toFixed(1)}%. Must be exactly 100% to submit.`
    );
  }
}
