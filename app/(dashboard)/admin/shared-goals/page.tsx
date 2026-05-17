"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Share2, Users, CheckCircle } from "lucide-react";

const UOM_OPTIONS = [
  { value: "NUMERIC_MIN", label: "📈 Numeric Min (Higher is better)" },
  { value: "NUMERIC_MAX", label: "📉 Numeric Max (Lower is better)" },
  { value: "TIMELINE", label: "📅 Timeline (Date-based)" },
  { value: "ZERO", label: "⚡ Zero Target (Zero = 100%)" },
];

export default function SharedGoalsPage() {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    thrustArea: "",
    title: "",
    description: "",
    uom: "NUMERIC_MIN",
    target: 100,
  });

  const { data: usersData } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  });

  const { data: cycleData } = useQuery({
    queryKey: ["active-cycle"],
    queryFn: () => fetch("/api/cycles").then((r) => r.json()),
  });

  const employees = (usersData?.users ?? []).filter(
    (u: any) => u.role === "EMPLOYEE"
  );
  const activeCycle = (cycleData?.cycles ?? []).find((c: any) => c.isActive);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((e: any) => e.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCycle) return setError("No active cycle found");
    if (selectedEmployees.length === 0)
      return setError("Select at least one employee");
    if (!form.thrustArea || !form.title || !form.description)
      return setError("Fill in all goal fields");

    setSaving(true);
    setError(null);
    setSuccessCount(null);

    try {
      const res = await fetch("/api/shared-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalTemplate: form,
          employeeIds: selectedEmployees,
          cycleId: activeCycle.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to push shared goal");
      } else {
        setSuccessCount(data.created);
        setSelectedEmployees([]);
        setForm({
          thrustArea: "",
          title: "",
          description: "",
          uom: "NUMERIC_MIN",
          target: 100,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-violet-600" />
          Push Shared Goal
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a goal template and push it to multiple employees instantly.
          Shared goals are pre-approved and locked.
        </p>
      </div>

      {successCount !== null && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium">
            ✅ Goal pushed to {successCount} employee
            {successCount !== 1 ? "s" : ""} successfully!
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Template */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            Goal Template
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thrust Area <span className="text-red-500">*</span>
            </label>
            <input
              value={form.thrustArea}
              onChange={(e) => setForm({ ...form, thrustArea: e.target.value })}
              placeholder="e.g. Safety Compliance"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Zero safety incidents in FY2025"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              placeholder="Describe how success is measured..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measurement
              </label>
              <select
                value={form.uom}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {UOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value
              </label>
              <input
                type="number"
                value={form.target}
                onChange={(e) =>
                  setForm({ ...form, target: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs">
            <strong>Note:</strong> Weightage defaults to 0% — employees must
            adjust their own weightage allocation after receiving this goal.
          </div>
        </div>

        {/* Employee Picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Select Employees ({selectedEmployees.length} selected)
            </h2>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-violet-600 hover:underline font-medium"
            >
              {selectedEmployees.length === employees.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72 space-y-2 pr-1">
            {employees.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-sm">
                Loading employees...
              </div>
            )}
            {employees.map((emp: any) => (
              <label
                key={emp.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEmployees.includes(emp.id)
                    ? "border-violet-300 bg-violet-50"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {emp.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {emp.department || "No dept"} •{" "}
                    {emp.manager?.name || "No manager"}
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {emp._count.goals} goals
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            {activeCycle ? (
              <p className="text-xs text-gray-500 mb-3">
                Active cycle:{" "}
                <span className="font-medium text-gray-700">
                  {activeCycle.name}
                </span>
              </p>
            ) : (
              <p className="text-xs text-red-500 mb-3">
                ⚠️ No active cycle found
              </p>
            )}
            <button
              type="submit"
              disabled={
                saving ||
                selectedEmployees.length === 0 ||
                !activeCycle
              }
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {saving
                ? "Pushing..."
                : `Push Goal to ${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
