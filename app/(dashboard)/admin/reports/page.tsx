"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ExportButton } from "@/components/shared/ExportButton";

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => fetch("/api/reports/achievement").then((r) => r.json()),
  });

  const report = data?.report || [];
  const cycle = data?.cycle;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievement Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            {cycle?.name} • {report.length} employees
          </p>
        </div>
        <ExportButton />
      </div>

      {report.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
          No data yet. Goals must be approved and achievements logged.
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Goals</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.map((employee: any) => (
                    <React.Fragment key={employee.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-400">{employee.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{employee.department || "—"}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{employee.totalGoals}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            employee.avgProgressScore >= 90 ? "text-green-600" :
                            employee.avgProgressScore >= 70 ? "text-yellow-600" :
                            employee.avgProgressScore > 0 ? "text-red-600" : "text-gray-400"
                          }`}>
                            {employee.avgProgressScore > 0 ? `${employee.avgProgressScore}%` : "—"}
                          </span>
                        </td>
                      </tr>
                      {employee.goals.map((goal: any) => (
                        <tr key={goal.id} className="bg-gray-50/50">
                          <td className="px-4 py-2 pl-8" colSpan={1}>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{goal.title}</div>
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-400">Weight: {goal.weightage}%</td>
                          <td className="px-4 py-2 text-right text-xs text-gray-500">
                            Q1: {goal.q1 !== null ? `${goal.q1.toFixed(0)}%` : "—"} |
                            Q2: {goal.q2 !== null ? `${goal.q2.toFixed(0)}%` : "—"} |
                            Q3: {goal.q3 !== null ? `${goal.q3.toFixed(0)}%` : "—"} |
                            Q4: {goal.q4 !== null ? `${goal.q4.toFixed(0)}%` : "—"}
                          </td>
                          <td />
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Completion Dashboard Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Check-in Completion Status</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Q1</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Q2</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Q3</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Q4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {report.map((employee: any) => {
                      const hasQ1 = employee.goals.length > 0 && employee.goals.some((g: any) => g.q1 !== null);
                      const hasQ2 = employee.goals.length > 0 && employee.goals.some((g: any) => g.q2 !== null);
                      const hasQ3 = employee.goals.length > 0 && employee.goals.some((g: any) => g.q3 !== null);
                      const hasQ4 = employee.goals.length > 0 && employee.goals.some((g: any) => g.q4 !== null);
                      
                      return (
                        <tr key={`completion-${employee.id}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{employee.name}</td>
                          <td className="px-4 py-3 text-center text-lg">{hasQ1 ? "✅" : "❌"}</td>
                          <td className="px-4 py-3 text-center text-lg">{hasQ2 ? "✅" : "❌"}</td>
                          <td className="px-4 py-3 text-center text-lg">{hasQ3 ? "✅" : "❌"}</td>
                          <td className="px-4 py-3 text-center text-lg">{hasQ4 ? "✅" : "❌"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
