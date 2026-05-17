import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { goalId, quarter, comment } = await req.json();
  if (!goalId || !quarter || !comment) {
    return NextResponse.json({ error: "goalId, quarter, and comment required" }, { status: 400 });
  }

  const checkin = await prisma.checkin.create({
    data: { goalId, managerId: session.user.id, quarter, comment },
  });

  return NextResponse.json({ checkin }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const goalId = searchParams.get("goalId");

  const checkins = await prisma.checkin.findMany({
    where: goalId ? { goalId } : undefined,
    include: {
      manager: { select: { name: true, email: true } },
      goal: { select: { title: true, userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ checkins });
}
