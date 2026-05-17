"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const QUARTER_COLORS: Record<string, string> = {
  Q1: "text-blue-600",
  Q2: "text-violet-600",
  Q3: "text-orange-600",
  Q4: "text-green-600",
};

export default function AchievementsPage() {
  const queryClient = useQueryClient();
  const [logging, setLogging] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, { actual: string; status: string; notes: string }>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: goalsData } = useQuery({
    queryKey: ["goals"],
    queryFn: () => fetch("/api/goals").then((r) => r.json()),
  });

  const { data: cycleData } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => fetch("/api/cycles").then((r) => r.json()),
  });

  const goals = (goalsData?.goals || []).filter((g: any) => g.status === "LOCKED");
  const cycle = cycleData?.activeCycle;

  const getActiveQuarter = () => {
    if (!cycle) return null;
    const now = new Date();
    if (now >= new Date(cycle.q1Start) && now <= new Date(cycle.q1End)) return "Q1";
    if (now >= new Date(cycle.q2Start) && now <= new Date(cycle.q2End)) return "Q2";
    if (now >= new Date(cycle.q3Start) && now <= new Date(cycle.q3End)) return "Q3";
    if (now >= new Date(cycle.q4Start) && now <= new Date(cycle.q4End)) return "Q4";
    return null;
  };

  const activeQuarter = getActiveQuarter();

  const logAchievement = async (goalId: string) => {
    const v = values[goalId];
    if (!v?.actual) return;

    setLogging(goalId);
    setError(null);
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          actual: parseFloat(v.actual),
          status: v.status || "ON_TRACK",
          notes: v.notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        return;
      }
      setSuccess(`Achievement logged for ${activeQuarter}!`);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setValues((prev) => ({ ...prev, [goalId]: { actual: "", status: "ON_TRACK", notes: "" } }));
    } finally {
      setLogging(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievement Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">
          Current quarter:{" "}
          <span className={`font-semibold ${activeQuarter ? "text-green-600" : "text-gray-400"}`}>
            {activeQuarter || "No active window"}
          </span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">{success}</div>
      )}

      {!activeQuarter && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          ⏳ Achievement tracking is not currently open. Logging is only available during active quarter windows.
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No locked goals found. Goals must be approved and locked before logging achievements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal: any) => (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded">
                    {goal.thrustArea}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 mt-1">{goal.title}</h3>
                  <p className="text-xs text-gray-500">Target: {goal.target} • Weight: {goal.weightage}%</p>
                </div>
              </div>

              {/* Quarter Progress */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                  const a = goal.achievements?.find((x: any) => x.quarter === q);
                  const isActive = q === activeQuarter;
                  return (
                    <div
                      key={q}
                      className={`rounded-lg p-2 text-center border ${isActive ? "border-violet-300 bg-violet-50" : "border-gray-100 bg-gray-50"}`}
                    >
                      <div className={`text-xs font-medium ${QUARTER_COLORS[q]}`}>{q}</div>
                      <div className="text-base font-bold text-gray-900 mt-0.5">
                        {a?.progressScore !== null && a?.progressScore !== undefined
                          ? `${a.progressScore.toFixed(0)}%`
                          : "—"}
                      </div>
                      {a?.actual !== null && a?.actual !== undefined && (
                        <div className="text-xs text-gray-400">Actual: {a.actual}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Log Form */}
              {activeQuarter && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Log {activeQuarter} Achievement
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <div>
                      <label className="text-xs text-gray-400">Actual Value</label>
                      <input
                        type="number"
                        step="any"
                        value={values[goal.id]?.actual || ""}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [goal.id]: { ...prev[goal.id], actual: e.target.value },
                          }))
                        }
                        placeholder="Enter actual"
                        className="block mt-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-36"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Status</label>
                      <select
                        value={values[goal.id]?.status || "ON_TRACK"}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [goal.id]: { ...prev[goal.id], status: e.target.value },
                          }))
                        }
                        className="block mt-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="ON_TRACK">On Track</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-48">
                      <label className="text-xs text-gray-400">Notes (optional)</label>
                      <input
                        type="text"
                        value={values[goal.id]?.notes || ""}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [goal.id]: { ...prev[goal.id], notes: e.target.value },
                          }))
                        }
                        placeholder="Add notes..."
                        className="block mt-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-full"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => logAchievement(goal.id)}
                        disabled={logging === goal.id || !values[goal.id]?.actual}
                        className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-all disabled:opacity-50"
                      >
                        {logging === goal.id ? "Saving..." : "Log"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
