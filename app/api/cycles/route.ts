import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) return NextResponse.json({ cycles: [], activeCycle: null });

  const cycles = await prisma.cycle.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ cycles, activeCycle });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();

  // Deactivate all current cycles
  await prisma.cycle.updateMany({ data: { isActive: false } });

  const cycle = await prisma.cycle.create({
    data: { ...body, isActive: true },
  });

  return NextResponse.json({ cycle }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;

  if (data.isActive) {
    await prisma.cycle.updateMany({ data: { isActive: false } });
  }

  const cycle = await prisma.cycle.update({ where: { id }, data });
  return NextResponse.json({ cycle });
}
