import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("demo123", 10);

    // Create Employee
    const employee = await prisma.user.upsert({
      where: { email: "employee@demo.com" },
      update: {},
      create: {
        email: "employee@demo.com",
        name: "Demo Employee",
        password: passwordHash,
        role: "EMPLOYEE",
        department: "Engineering",
      },
    });

    // Create Manager
    const manager = await prisma.user.upsert({
      where: { email: "manager@demo.com" },
      update: {},
      create: {
        email: "manager@demo.com",
        name: "Demo Manager",
        password: passwordHash,
        role: "MANAGER",
        department: "Engineering",
      },
    });

    // Create Admin
    const admin = await prisma.user.upsert({
      where: { email: "admin@demo.com" },
      update: {},
      create: {
        email: "admin@demo.com",
        name: "Demo Admin",
        password: passwordHash,
        role: "ADMIN",
        department: "Operations",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      users: { employee, manager, admin }
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
