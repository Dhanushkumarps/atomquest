import { StatusBadge } from "@/components/shared/StatusBadge";
import type { GoalStatus, UoM } from "@/types";
import { Target, BarChart2, Calendar, Zap } from "lucide-react";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    thrustArea: string;
    status: GoalStatus;
    weightage: number;
    target: number;
    uom: UoM;
    achievements?: Array<{ quarter: string; progressScore: number | null }>;
  };
  onClick?: () => void;
}

const UOM_ICONS: Record<UoM, React.ReactNode> = {
  NUMERIC_MIN: <BarChart2 className="w-3.5 h-3.5" />,
  NUMERIC_MAX: <Target className="w-3.5 h-3.5" />,
  TIMELINE: <Calendar className="w-3.5 h-3.5" />,
  ZERO: <Zap className="w-3.5 h-3.5" />,
};

function getLatestScore(achievements: Array<{ quarter: string; progressScore: number | null }>) {
  const order = ["Q4", "Q3", "Q2", "Q1"];
  for (const q of order) {
    const a = achievements.find((x) => x.quarter === q);
    if (a?.progressScore !== null && a?.progressScore !== undefined) return a.progressScore;
  }
  return null;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const latestScore = goal.achievements ? getLatestScore(goal.achievements) : null;
  const scoreColor =
    latestScore === null
      ? "bg-gray-100"
      : latestScore >= 90
      ? "bg-green-100 text-green-700"
      : latestScore >= 70
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-violet-200" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded">
              {goal.thrustArea}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
            {goal.title}
          </h3>
        </div>
        <StatusBadge status={goal.status} />
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {UOM_ICONS[goal.uom]}
          <span>Target: {goal.target}</span>
        </div>
        <div className="text-xs text-gray-500">Weight: {goal.weightage}%</div>

        {latestScore !== null && (
          <div className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor}`}>
            {latestScore.toFixed(0)}%
          </div>
        )}
      </div>

      {goal.achievements && goal.achievements.length > 0 && (
        <div className="flex gap-1 mt-2">
          {["Q1", "Q2", "Q3", "Q4"].map((q) => {
            const a = goal.achievements!.find((x) => x.quarter === q);
            const score = a?.progressScore ?? null;
            return (
              <div
                key={q}
                className={`flex-1 h-1.5 rounded-full ${
                  score === null
                    ? "bg-gray-100"
                    : score >= 90
                    ? "bg-green-400"
                    : score >= 70
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
                title={`${q}: ${score !== null ? score.toFixed(0) + "%" : "Not logged"}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
