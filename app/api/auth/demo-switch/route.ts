import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

// Demo role switcher - signs in as pre-seeded demo accounts
export async function POST(req: Request) {
  const { role } = await req.json();

  const roleEmailMap: Record<string, string> = {
    EMPLOYEE: "employee@demo.com",
    MANAGER: "manager@demo.com",
    ADMIN: "admin@demo.com",
  };

  const email = roleEmailMap[role];
  if (!email) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  return NextResponse.json({ email, password: "demo123" });
}
