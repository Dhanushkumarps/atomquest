import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const rules = await prisma.escalationRule.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const rule = await prisma.escalationRule.create({ data: body });
  return NextResponse.json({ rule }, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id, ...data } = await req.json();
  const rule = await prisma.escalationRule.update({ where: { id }, data });
  return NextResponse.json({ rule });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.escalationRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
