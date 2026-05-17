import type { Cycle } from "@prisma/client";

export type ActiveWindow =
  | "GOAL_SETTING"
  | "Q1"
  | "Q2"
  | "Q3"
  | "Q4"
  | "CLOSED";

export function getActiveWindow(cycle: Cycle): ActiveWindow {
  const now = new Date();

  if (now >= cycle.goalSettingStart && now <= cycle.goalSettingEnd)
    return "GOAL_SETTING";
  if (now >= cycle.q1Start && now <= cycle.q1End) return "Q1";
  if (now >= cycle.q2Start && now <= cycle.q2End) return "Q2";
  if (now >= cycle.q3Start && now <= cycle.q3End) return "Q3";
  if (now >= cycle.q4Start && now <= cycle.q4End) return "Q4";
  return "CLOSED";
}

export function activeWindowToQuarter(
  window: ActiveWindow
): "Q1" | "Q2" | "Q3" | "Q4" | null {
  if (window === "Q1") return "Q1";
  if (window === "Q2") return "Q2";
  if (window === "Q3") return "Q3";
  if (window === "Q4") return "Q4";
  return null;
}
