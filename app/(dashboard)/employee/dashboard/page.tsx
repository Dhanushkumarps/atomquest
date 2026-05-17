import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveWindow } from "@/lib/cycle-utils";
import { GoalCard } from "@/components/goals/GoalCard";
import { Target, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const session = await auth();
  if (!session) return null;

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const window = activeCycle ? getActiveWindow(activeCycle) : "CLOSED";

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id, cycleId: activeCycle?.id },
    include: { achievements: true },
    orderBy: { createdAt: "desc" },
  });

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  const lockedGoals = goals.filter((g) => g.status === "LOCKED");
  const avgScore =
    lockedGoals.length > 0
      ? lockedGoals.reduce((sum, g) => {
          const scores = g.achievements.map((a) => a.progressScore ?? 0);
          const avg = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
          return sum + avg * (g.weightage / 100);
        }, 0)
      : null;

  const stats = [
    {
      label: "Total Goals",
      value: goals.length,
      icon: Target,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      label: "Total Weightage",
      value: `${totalWeightage.toFixed(0)}%`,
      icon: TrendingUp,
      color: totalWeightage === 100 ? "text-green-600" : "text-orange-600",
      bg: totalWeightage === 100 ? "bg-green-50" : "bg-orange-50",
      border: totalWeightage === 100 ? "border-green-100" : "border-orange-100",
    },
    {
      label: "Approved/Locked",
      value: lockedGoals.length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Avg Progress Score",
      value: avgScore !== null ? `${avgScore.toFixed(1)}%` : "—",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {activeCycle ? `${activeCycle.name} • Current Window: ` : "No active cycle"}
            {activeCycle && (
              <span
                className={`font-medium ${
                  window === "GOAL_SETTING"
                    ? "text-violet-600"
                    : window === "CLOSED"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {window}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/employee/goals?new=true"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200"
        >
          + New Goal
        </Link>
      </div>

      {/* Alerts */}
      {totalWeightage < 100 && goals.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Action needed:</strong> Your total goal weightage is {totalWeightage.toFixed(0)}%. 
            Add more goals or adjust weightages to reach exactly 100% before submitting.
          </div>
        </div>
      )}

      {goals.some((g) => g.status === "REWORK") && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Goals returned for revision:</strong> Your manager has returned some goals. 
            Please review the feedback and resubmit.
            <span className="ml-2 text-xs italic text-red-600">
              Reason: {goals.find((g) => g.status === "REWORK")?.returnReason}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bg} border ${stat.border} rounded-xl p-4`}
            >
              <div className={`${stat.color} mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">My Goals</h2>
          <Link href="/employee/goals" className="text-sm text-violet-600 hover:text-violet-800">
            View all →
          </Link>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No goals yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first goal to get started
            </p>
            <Link
              href="/employee/goals?new=true"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-all"
            >
              + Create Goal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <Link key={goal.id} href={`/employee/goals/${goal.id}`}>
                <GoalCard goal={goal as any} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Submit */}
      {goals.some((g) => g.status === "DRAFT" || g.status === "REWORK") &&
        Math.abs(totalWeightage - 100) < 0.01 && (
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
            <p className="text-sm text-violet-800 font-medium mb-3">
              ✅ Your weightage totals 100%. Ready to submit for manager approval?
            </p>
            <Link
              href="/employee/goals"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
            >
              Submit Goals for Approval →
            </Link>
          </div>
        )}
    </div>
  );
}
