"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const TRIGGERS = ["GOAL_NOT_SUBMITTED", "MANAGER_NOT_APPROVED", "CHECKIN_OVERDUE"];

export default function AdminEscalationsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    trigger: "CHECKIN_OVERDUE",
    daysThreshold: 7,
    notifyEmployee: true,
    notifyManager: true,
    notifyHR: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["escalation-rules"],
    queryFn: () => fetch("/api/escalations/rules").then((r) => r.json()),
  });

  const rules = data?.rules || [];

  const handleCreate = async () => {
    setSaving(true);
    try {
      await fetch("/api/escalations/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    } finally { setSaving(false); }
  };

  const handleToggle = async (rule: any) => {
    await fetch("/api/escalations/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
    });
    queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    await fetch("/api/escalations/rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
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
          <h1 className="text-2xl font-bold text-gray-900">Escalation Rules</h1>
          <p className="text-gray-500 text-sm mt-1">Configure automated notification rules</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all">
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Escalation Rule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Trigger</label>
              <select value={form.trigger} onChange={(e) => setForm({...form, trigger: e.target.value})}
                className="block mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                {TRIGGERS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Days Threshold</label>
              <input type="number" value={form.daysThreshold} onChange={(e) => setForm({...form, daysThreshold: Number(e.target.value)})}
                className="block mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            {["notifyEmployee", "notifyManager", "notifyHR"].map((field) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[field]}
                  onChange={(e) => setForm({...form, [field]: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                <span className="text-sm text-gray-700">{field.replace("notify", "Notify ")}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
              {saving ? "Saving..." : "Create Rule"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.map((rule: any) => (
          <div key={rule.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-center justify-between ${rule.isActive ? "border-green-200" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium text-gray-900 text-sm">{rule.trigger.replace(/_/g, " ")}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  After {rule.daysThreshold} days •{" "}
                  {[
                    rule.notifyEmployee && "Employee",
                    rule.notifyManager && "Manager",
                    rule.notifyHR && "HR",
                  ].filter(Boolean).join(", ")} notified
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(rule)} className="text-gray-400 hover:text-violet-600 transition-all">
                {rule.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
              <button onClick={() => handleDelete(rule.id)} className="text-gray-300 hover:text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {rules.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400">No escalation rules yet. Create one to get started.</div>
        )}
      </div>
    </div>
  );
}
