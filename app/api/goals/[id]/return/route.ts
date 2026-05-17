import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendGoalReturnedEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only managers can return goals" }, { status: 403 });
  }

  const { reason } = await req.json();
  if (!reason) return NextResponse.json({ error: "Return reason is required" }, { status: 400 });

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Goal is not in SUBMITTED state" }, { status: 400 });
  }

  const oldValue = { status: goal.status };

  // Return all this user's submitted goals in this cycle
  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  await prisma.goal.updateMany({
    where: { userId: goal.userId, cycleId: activeCycle?.id, status: "SUBMITTED" },
    data: { status: "REWORK", returnReason: reason },
  });

  await writeAuditLog({
    entityType: "Goal",
    entityId: id,
    userId: session.user.id,
    action: "RETURN",
    oldValue,
    newValue: { status: "REWORK", reason },
  });

  await sendGoalReturnedEmail(goal.user.email, goal.user.name, reason);

  return NextResponse.json({ success: true });
}
