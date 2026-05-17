import type { GoalStatus } from "@/types";

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-200" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700 border-blue-200" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 border-green-200" },
  REWORK: { label: "Needs Rework", className: "bg-red-100 text-red-700 border-red-200" },
  LOCKED: { label: "🔒 Locked", className: "bg-violet-100 text-violet-700 border-violet-200" },
};

export function StatusBadge({ status }: { status: GoalStatus }) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
