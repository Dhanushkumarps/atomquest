import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function ManagerDashboard() {
  const session = await auth();
  if (!session) return null;

  const team = await prisma.user.findMany({
    where: { managerId: session.user.id },
    include: {
      goals: {
        include: { achievements: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  const pendingApprovals = team.flatMap((m) =>
    m.goals.filter(
      (g) => g.cycleId === activeCycle?.id && g.status === "SUBMITTED"
    )
  );

  const stats = [
    { label: "Team Members", value: team.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Pending Approvals", value: pendingApprovals.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Goals Locked", value: team.flatMap(m => m.goals.filter(g => g.status === "LOCKED")).length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "Active Cycle", value: activeCycle?.name || "None", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your team&apos;s goals and check-ins</p>
        </div>
        {pendingApprovals.length > 0 && (
          <Link
            href="/manager/approvals"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 animate-pulse"
          >
            <Clock className="w-4 h-4" />
            {pendingApprovals.length} Pending Approvals
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4`}>
              <div className={`${stat.color} mb-2`}><Icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Team Members */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Team Members</h2>
        <div className="space-y-3">
          {team.map((member) => {
            const cycleGoals = member.goals.filter((g) => g.cycleId === activeCycle?.id);
            const lockedGoals = cycleGoals.filter((g) => g.status === "LOCKED");
            const submittedGoals = cycleGoals.filter((g) => g.status === "SUBMITTED");

            return (
              <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-400">{member.email} • {member.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-500">
                    {cycleGoals.length} goals
                    {submittedGoals.length > 0 && <span className="ml-2 text-orange-600 font-medium">• {submittedGoals.length} pending review</span>}
                    {lockedGoals.length > 0 && <span className="ml-2 text-green-600 font-medium">• {lockedGoals.length} approved</span>}
                  </div>
                  <Link
                    href={`/manager/checkins/${member.id}`}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-all"
                  >
                    Check-in
                  </Link>
                </div>
              </div>
            );
          })}
          {team.length === 0 && (
            <div className="text-center py-8 text-gray-400">No team members assigned to you yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
