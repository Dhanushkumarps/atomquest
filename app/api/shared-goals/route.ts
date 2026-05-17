import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { goalTemplate, employeeIds, cycleId } = body;

  // Validate inputs
  if (!goalTemplate || !cycleId) {
    return NextResponse.json(
      { error: "goalTemplate and cycleId are required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return NextResponse.json(
      { error: "employeeIds must be a non-empty array" },
      { status: 400 }
    );
  }

  // Verify cycle exists
  const cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
  if (!cycle) {
    return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
  }

  // Verify all employees exist
  const employees = await prisma.user.findMany({
    where: { id: { in: employeeIds }, role: "EMPLOYEE" },
    select: { id: true },
  });
  if (employees.length !== employeeIds.length) {
    return NextResponse.json(
      { error: "One or more employee IDs are invalid" },
      { status: 400 }
    );
  }

  // Create one goal per employee
  const created = await Promise.all(
    employeeIds.map(async (employeeId: string) => {
      const goal = await prisma.goal.create({
        data: {
          userId: employeeId,
          cycleId,
          thrustArea: goalTemplate.thrustArea,
          title: goalTemplate.title,
          description: goalTemplate.description,
          uom: goalTemplate.uom,
          target: goalTemplate.target,
          weightage: 0, // employee sets their own weightage
          isShared: true,
          sharedFromId: null,
          status: "APPROVED",
          lockedAt: new Date(),
        },
      });

      await writeAuditLog({
        entityType: "Goal",
        entityId: goal.id,
        userId: session.user.id,
        action: "SHARED_GOAL_PUSH",
        newValue: { goalTemplate, employeeId, cycleId },
      });

      return goal;
    })
  );

  return NextResponse.json({ created: created.length });
}
