import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      department: true, managerId: true,
      manager: { select: { name: true } },
      _count: { select: { goals: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(body.password || "demo123", 10);

  const user = await prisma.user.create({
    data: { ...body, password: hashed },
  });

  return NextResponse.json({ user }, { status: 201 });
}
