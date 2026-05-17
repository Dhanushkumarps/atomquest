export type UserRole = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type GoalStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REWORK" | "LOCKED";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type UoM = "NUMERIC_MIN" | "NUMERIC_MAX" | "TIMELINE" | "ZERO";
export type AchievementStatus = "NOT_STARTED" | "ON_TRACK" | "COMPLETED";
export type EscalationTrigger = "GOAL_NOT_SUBMITTED" | "MANAGER_NOT_APPROVED" | "CHECKIN_OVERDUE";
export type ActiveWindow = "GOAL_SETTING" | "Q1" | "Q2" | "Q3" | "Q4" | "CLOSED";

export interface GoalSuggestion {
  thrustArea: string;
  title: string;
  description: string;
  uom: UoM;
  suggestedTarget: number;
  weightageSuggestion: number;
}

export interface DashboardStats {
  totalGoals: number;
  approvedGoals: number;
  pendingGoals: number;
  avgProgressScore: number;
  currentQuarter: string;
}
