"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";

export default function AdminCyclesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "FY2025-26",
    goalSettingStart: "2025-04-01",
    goalSettingEnd: "2025-04-30",
    q1Start: "2025-04-01", q1End: "2025-06-30",
    q2Start: "2025-07-01", q2End: "2025-09-30",
    q3Start: "2025-10-01", q3End: "2025-12-31",
    q4Start: "2026-01-01", q4End: "2026-03-31",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => fetch("/api/cycles").then((r) => r.json()),
  });

  const cycles = data?.cycles || [];

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(form).reduce((acc, [k, v]) => {
        acc[k] = k === "name" ? v : new Date(v).toISOString();
        return acc;
      }, {} as any);

      await fetch("/api/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
    } finally { setSaving(false); }
  };

  const setActive = async (id: string) => {
    await fetch("/api/cycles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    queryClient.invalidateQueries({ queryKey: ["cycles"] });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goal Cycles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage annual goal-setting cycles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Cycle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Cycle</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Cycle Name</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="block mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            {Object.entries(form).filter(([k]) => k !== "name").map(([key, val]) => (
              <div key={key}>
                <label className="text-xs text-gray-500">{key.replace(/([A-Z])/g, " $1").trim()}</label>
                <input type="date" value={val} onChange={(e) => setForm({...form, [key]: e.target.value})}
                  className="block mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
              {saving ? "Creating..." : "Create Cycle"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {cycles.map((cycle: any) => (
          <div key={cycle.id} className={`bg-white rounded-xl border p-5 shadow-sm ${cycle.isActive ? "border-violet-300 ring-2 ring-violet-100" : "border-gray-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{cycle.name}</h3>
                    {cycle.isActive && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        🟢 Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Goal Setting: {format(new Date(cycle.goalSettingStart), "MMM d")} – {format(new Date(cycle.goalSettingEnd), "MMM d, yyyy")}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>Q1: {format(new Date(cycle.q1Start), "MMM d")} – {format(new Date(cycle.q1End), "MMM d")}</span>
                    <span>Q2: {format(new Date(cycle.q2Start), "MMM d")} – {format(new Date(cycle.q2End), "MMM d")}</span>
                    <span>Q3: {format(new Date(cycle.q3Start), "MMM d")} – {format(new Date(cycle.q3End), "MMM d")}</span>
                    <span>Q4: {format(new Date(cycle.q4Start), "MMM d")} – {format(new Date(cycle.q4End), "MMM d")}</span>
                  </div>
                </div>
              </div>
              {!cycle.isActive && (
                <button onClick={() => setActive(cycle.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-50 transition-all">
                  <Unlock className="w-3.5 h-3.5" />
                  Set Active
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
