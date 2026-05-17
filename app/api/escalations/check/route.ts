import { prisma } from "@/lib/prisma";
import { getActiveWindow, activeWindowToQuarter } from "@/lib/cycle-utils";
import {
  sendCheckinReminderEmail,
  sendGoalSubmittedEmail,
} from "@/lib/email";
import { NextResponse } from "next/server";

// Called daily by Vercel Cron (see vercel.json) or manually with Bearer token
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!activeCycle) {
    return NextResponse.json({ processed: 0, message: "No active cycle" });
  }

  const activeRules = await prisma.escalationRule.findMany({
    where: { isActive: true },
  });

  let processed = 0;
  const now = new Date();

  for (const rule of activeRules) {
    const cutoff = new Date(now.getTime() - rule.daysThreshold * 86400000);

    // ── GOAL_NOT_SUBMITTED ──────────────────────────────────────────────────
    if (rule.trigger === "GOAL_NOT_SUBMITTED") {
      // Goal-setting window must have opened more than daysThreshold days ago
      if (activeCycle.goalSettingStart > cutoff) continue;

      const employees = await prisma.user.findMany({
        where: {
          role: "EMPLOYEE",
          goals: {
            none: {
              cycleId: activeCycle.id,
              status: { in: ["SUBMITTED", "APPROVED", "LOCKED"] },
            },
          },
        },
        include: { manager: true },
      });

      for (const emp of employees) {
        console.log(
          `[ESCALATION] GOAL_NOT_SUBMITTED → ${emp.email} (rule ${rule.id})`
        );
        if (rule.notifyEmployee) {
          await sendCheckinReminderEmail(
            emp.email,
            emp.name,
            "Goal Submission"
          );
        }
        if (rule.notifyManager && emp.manager) {
          await sendGoalSubmittedEmail(
            emp.manager.email,
            emp.name,
            emp.manager.name
          );
        }
        processed++;
      }
    }

    // ── MANAGER_NOT_APPROVED ────────────────────────────────────────────────
    if (rule.trigger === "MANAGER_NOT_APPROVED") {
      const pendingGoals = await prisma.goal.findMany({
        where: {
          cycleId: activeCycle.id,
          status: "SUBMITTED",
          updatedAt: { lt: cutoff },
        },
        include: {
          user: { include: { manager: true } },
        },
      });

      const notifiedManagers = new Set<string>();
      for (const goal of pendingGoals) {
        const manager = goal.user.manager;
        if (manager && !notifiedManagers.has(manager.id)) {
          console.log(
            `[ESCALATION] MANAGER_NOT_APPROVED → manager ${manager.email} (rule ${rule.id})`
          );
          await sendGoalSubmittedEmail(
            manager.email,
            goal.user.name,
            manager.name
          );
          notifiedManagers.add(manager.id);
          processed++;
        }
      }
    }

    // ── CHECKIN_OVERDUE ─────────────────────────────────────────────────────
    if (rule.trigger === "CHECKIN_OVERDUE") {
      const window = getActiveWindow(activeCycle);
      const quarter = activeWindowToQuarter(window);
      if (!quarter) continue; // Not in a check-in window

      // Determine when this quarter's window opened
      const quarterStartField =
        quarter === "Q1"
          ? activeCycle.q1Start
          : quarter === "Q2"
          ? activeCycle.q2Start
          : quarter === "Q3"
          ? activeCycle.q3Start
          : activeCycle.q4Start;

      if (quarterStartField > cutoff) continue; // Window hasn't been open long enough

      const employees = await prisma.user.findMany({
        where: {
          role: "EMPLOYEE",
          goals: {
            some: {
              cycleId: activeCycle.id,
              status: "LOCKED",
              achievements: { none: { quarter } },
            },
          },
        },
        include: { manager: true },
      });

      for (const emp of employees) {
        console.log(
          `[ESCALATION] CHECKIN_OVERDUE (${quarter}) → ${emp.email} (rule ${rule.id})`
        );
        if (rule.notifyEmployee) {
          await sendCheckinReminderEmail(emp.email, emp.name, quarter);
        }
        if (rule.notifyManager && emp.manager) {
          await sendCheckinReminderEmail(
            emp.manager.email,
            emp.manager.name,
            `${quarter} (for ${emp.name})`
          );
        }
        processed++;
      }
    }
  }

  return NextResponse.json({ processed });
}
