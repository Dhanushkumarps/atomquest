import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validations/goal";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, department: true } },
      achievements: true,
      checkins: { include: { manager: { select: { name: true } } } },
      cycle: true,
    },
  });

  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  return NextResponse.json({ goal });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  // Only owner or admin can edit
  if (goal.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // If locked and not admin, block
  if (goal.status === "LOCKED" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Goal is locked. Contact admin to unlock." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = goalSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const oldValue = { ...goal };
  const updated = await prisma.goal.update({
    where: { id },
    data: parsed.data,
  });

  if (goal.status === "LOCKED") {
    await writeAuditLog({
      entityType: "Goal",
      entityId: id,
      userId: session.user.id,
      action: "EDIT",
      oldValue,
      newValue: updated as any,
    });
  }

  return NextResponse.json({ goal: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (goal.status === "LOCKED" || goal.status === "APPROVED") {
    return NextResponse.json({ error: "Cannot delete approved/locked goals" }, { status: 403 });
  }

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
