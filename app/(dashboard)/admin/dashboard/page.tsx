import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, Target, BarChart3, Shield } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  
  const [userCount, goalCount, cycleCount, auditCount] = await Promise.all([
    prisma.user.count(),
    prisma.goal.count(),
    prisma.cycle.count(),
    prisma.auditLog.count(),
  ]);

  const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const goalsByStatus = await prisma.goal.groupBy({
    by: ["status"],
    where: activeCycle ? { cycleId: activeCycle.id } : {},
    _count: { status: true },
  });

  const statusMap = goalsByStatus.reduce((acc: Record<string, number>, g) => ({ ...acc, [g.status]: g._count.status }), {} as Record<string, number>);

  const cards = [
    { label: "Total Users", value: userCount, icon: Users, href: "/admin/users", color: "from-blue-500 to-blue-600" },
    { label: "Total Goals", value: goalCount, icon: Target, href: "/admin/reports", color: "from-violet-500 to-purple-600" },
    { label: "Active Cycle", value: activeCycle?.name || "None", icon: BarChart3, href: "/admin/cycles", color: "from-green-500 to-emerald-600" },
    { label: "Audit Events", value: auditCount, icon: Shield, href: "/admin/audit", color: "from-orange-500 to-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Organization-wide overview for {activeCycle?.name || "current cycle"}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${card.color} opacity-10 rounded-bl-3xl`} />
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.color} mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Goal Status Breakdown */}
      {activeCycle && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Goal Status — {activeCycle.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { status: "DRAFT", color: "bg-gray-100 text-gray-700" },
              { status: "SUBMITTED", color: "bg-blue-100 text-blue-700" },
              { status: "APPROVED", color: "bg-green-100 text-green-700" },
              { status: "REWORK", color: "bg-red-100 text-red-700" },
              { status: "LOCKED", color: "bg-violet-100 text-violet-700" },
            ].map(({ status, color }) => (
              <div key={status} className={`rounded-lg p-3 text-center ${color}`}>
                <div className="text-2xl font-bold">{statusMap[status] || 0}</div>
                <div className="text-xs font-medium capitalize mt-0.5">{status.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/admin/reports", label: "📊 Generate Reports", desc: "View achievement data and export CSV" },
          { href: "/admin/analytics", label: "📈 Analytics Charts", desc: "QoQ trends and goal distribution" },
          { href: "/admin/escalations", label: "🚨 Escalation Rules", desc: "Configure automated reminders" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-violet-200 hover:shadow-md transition-all"
          >
            <div className="font-semibold text-gray-900">{action.label}</div>
            <div className="text-xs text-gray-500 mt-1">{action.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
