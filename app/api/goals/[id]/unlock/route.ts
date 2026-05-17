import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can unlock goals" }, { status: 403 });
  }

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.status !== "LOCKED") {
    return NextResponse.json({ error: "Goal is not locked" }, { status: 400 });
  }

  const oldValue = { status: goal.status, lockedAt: goal.lockedAt };
  const updated = await prisma.goal.update({
    where: { id },
    data: { status: "APPROVED", lockedAt: null },
  });

  await writeAuditLog({
    entityType: "Goal",
    entityId: id,
    userId: session.user.id,
    action: "UNLOCK",
    oldValue,
    newValue: { status: "APPROVED" },
  });

  return NextResponse.json({ goal: updated });
}
