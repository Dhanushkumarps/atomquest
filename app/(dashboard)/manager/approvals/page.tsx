"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<string | null>(null);
  const [returnGoalId, setReturnGoalId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => fetch("/api/goals").then((r) => r.json()),
  });

  const goals = (data?.goals || []).filter((g: any) => g.status === "SUBMITTED");
  
  // Group by employee
  const byEmployee = goals.reduce((acc: any, goal: any) => {
    const uid = goal.user.id;
    if (!acc[uid]) acc[uid] = { user: goal.user, goals: [] };
    acc[uid].goals.push(goal);
    return acc;
  }, {});

  const handleApprove = async (goalId: string) => {
    setProcessing(goalId);
    setMessage(null);
    try {
      const res = await fetch(`/api/goals/${goalId}/approve`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: json.error }); return; }
      setMessage({ type: "success", text: "Goal approved and locked!" });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } finally { setProcessing(null); }
  };

  const handleReturn = async (goalId: string) => {
    if (!returnReason.trim()) return;
    setProcessing(goalId);
    setMessage(null);
    try {
      const res = await fetch(`/api/goals/${goalId}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason }),
      });
      const json = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: json.error }); return; }
      setMessage({ type: "success", text: "Goal returned for rework. Employee notified." });
      setReturnGoalId(null);
      setReturnReason("");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } finally { setProcessing(null); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Goal Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">{goals.length} goal(s) pending review</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending goal approvals</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(byEmployee).map((group: any) => {
            const totalWeight = group.goals.reduce((s: number, g: any) => s + g.weightage, 0);
            return (
              <div key={group.user.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Employee Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {group.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{group.user.name}</div>
                      <div className="text-xs text-gray-500">{group.user.email} • {group.user.department}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${Math.abs(totalWeight - 100) < 0.01 ? "text-green-600" : "text-red-600"}`}>
                    Total Weightage: {totalWeight.toFixed(0)}%
                    {Math.abs(totalWeight - 100) < 0.01 ? " ✓" : " ⚠️"}
                  </div>
                </div>

                {/* Goals Table */}
                <div className="divide-y divide-gray-50">
                  {group.goals.map((goal: any) => (
                    <div key={goal.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-medium">{goal.thrustArea}</span>
                            <StatusBadge status={goal.status} />
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm">{goal.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{goal.description}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-400">
                            <span>UoM: {goal.uom}</span>
                            <span>Target: {goal.target}</span>
                            <span>Weight: {goal.weightage}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {returnGoalId === goal.id ? (
                            <div className="flex flex-col gap-2 w-64">
                              <input
                                type="text"
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                placeholder="Reason for returning..."
                                className="px-3 py-1.5 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-300"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReturn(goal.id)}
                                  disabled={processing === goal.id || !returnReason.trim()}
                                  className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                  {processing === goal.id ? "..." : "Confirm Return"}
                                </button>
                                <button
                                  onClick={() => { setReturnGoalId(null); setReturnReason(""); }}
                                  className="px-2 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setReturnGoalId(goal.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Return
                              </button>
                              <button
                                onClick={() => handleApprove(goal.id)}
                                disabled={processing === goal.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {processing === goal.id ? "..." : "Approve"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
