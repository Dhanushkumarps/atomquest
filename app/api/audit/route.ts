import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return NextResponse.json({ logs });
}
