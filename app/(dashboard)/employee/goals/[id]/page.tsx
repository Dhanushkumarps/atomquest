"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { GoalForm } from "@/components/goals/GoalForm";
import { useState } from "react";
import { ArrowLeft, Lock, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

const UOM_LABELS: Record<string, string> = {
  NUMERIC_MIN: "📈 Numeric Min (Higher is better)",
  NUMERIC_MAX: "📉 Numeric Max (Lower is better)",
  TIMELINE: "📅 Timeline (Date-based)",
  ZERO: "⚡ Zero Target",
};

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["goal", id],
    queryFn: () => fetch(`/api/goals/${id}`).then((r) => r.json()),
  });

  const goal = data?.goal;

  const handleDelete = async () => {
    if (!confirm("Delete this goal?")) return;
    setDeleting(true);
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.push("/employee/goals");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!goal) return <div className="text-center py-12 text-gray-500">Goal not found</div>;

  const isLocked = goal.status === "LOCKED";
  const canEdit = goal.status === "DRAFT" || goal.status === "REWORK";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/employee/goals"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{goal.title}</h1>
            <StatusBadge status={goal.status} />
          </div>
          <p className="text-violet-600 text-sm font-medium mt-0.5">{goal.thrustArea}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {goal.returnReason && goal.status === "REWORK" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-800">Manager&apos;s feedback:</p>
          <p className="text-sm text-red-700 mt-1">{goal.returnReason}</p>
        </div>
      )}

      {editing ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <GoalForm
            goalId={id}
            initialData={goal}
            onSuccess={() => {
              setEditing(false);
              queryClient.invalidateQueries({ queryKey: ["goal", id] });
              queryClient.invalidateQueries({ queryKey: ["goals"] });
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          {isLocked && (
            <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg text-violet-700 text-sm">
              <Lock className="w-4 h-4" />
              This goal is locked. Approved on {goal.lockedAt ? new Date(goal.lockedAt).toLocaleDateString() : "—"}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{goal.description}</dd>
            </div>
            <div className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Unit of Measurement</dt>
                <dd className="mt-1 text-sm text-gray-900">{UOM_LABELS[goal.uom] || goal.uom}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Target</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{goal.target}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Weightage</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{goal.weightage}%</dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {isLocked && goal.achievements?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Q1", "Q2", "Q3", "Q4"].map((q) => {
              const a = goal.achievements.find((x: any) => x.quarter === q);
              return (
                <div key={q} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 font-medium mb-1">{q}</div>
                  <div className="text-xl font-bold text-gray-900">
                    {a?.progressScore !== null && a?.progressScore !== undefined
                      ? `${a.progressScore.toFixed(0)}%`
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {a ? a.status.replace("_", " ") : "Not logged"}
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href={`/employee/achievements/${id}`}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-all"
          >
            Log Achievement
          </Link>
        </div>
      )}

      {/* Check-ins */}
      {goal.checkins?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Check-ins</h2>
          <div className="space-y-3">
            {goal.checkins.map((c: any) => (
              <div key={c.id} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-700">{c.quarter}</span>
                  <span className="text-xs text-gray-400">by {c.manager.name}</span>
                </div>
                <p className="text-sm text-gray-700">{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
