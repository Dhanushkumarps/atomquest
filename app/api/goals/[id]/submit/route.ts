import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateFinalSubmission } from "@/lib/validations/goal";
import { sendGoalSubmittedEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Only employees can submit goals" }, { status: 403 });
  }

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });

  const allGoals = await prisma.goal.findMany({
    where: { userId: session.user.id, cycleId: activeCycle.id, status: { in: ["DRAFT", "REWORK"] } },
  });

  try {
    validateFinalSubmission(allGoals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Submit all DRAFT + REWORK goals
  await prisma.goal.updateMany({
    where: { userId: session.user.id, cycleId: activeCycle.id, status: { in: ["DRAFT", "REWORK"] } },
    data: { status: "SUBMITTED" },
  });

  // Notify manager
  if (session.user.managerId) {
    const manager = await prisma.user.findUnique({ where: { id: session.user.managerId } });
    if (manager) {
      await sendGoalSubmittedEmail(manager.email, session.user.name, manager.name);
    }
  }

  return NextResponse.json({ success: true, message: "Goals submitted for approval" });
}
