import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendGoalApprovedEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only managers can approve goals" }, { status: 403 });
  }

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Goal is not in SUBMITTED state" }, { status: 400 });
  }

  // Verify manager relationship
  if (session.user.role === "MANAGER" && goal.user.managerId !== session.user.id) {
    return NextResponse.json({ error: "You are not this employee's manager" }, { status: 403 });
  }

  const oldValue = { status: goal.status };
  const updated = await prisma.goal.update({
    where: { id },
    data: { status: "LOCKED", lockedAt: new Date() },
  });

  await writeAuditLog({
    entityType: "Goal",
    entityId: id,
    userId: session.user.id,
    action: "APPROVE",
    oldValue,
    newValue: { status: "LOCKED" },
  });

  await sendGoalApprovedEmail(goal.user.email, goal.user.name);

  return NextResponse.json({ goal: updated });
}
