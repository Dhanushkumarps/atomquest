"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";
import { useSession } from "next-auth/react";
import { Plus, Send, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmployeeGoalsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(() => searchParams.get("new") === "true");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => fetch("/api/goals").then((r) => r.json()),
  });

  const goals = data?.goals || [];
  const totalWeightage = goals.reduce((sum: number, g: any) => sum + g.weightage, 0);
  const hasDraftOrRework = goals.some((g: any) => g.status === "DRAFT" || g.status === "REWORK");
  const isReady = Math.abs(totalWeightage - 100) < 0.01 && hasDraftOrRework;

  const handleSubmit = async () => {
    if (!isReady) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const firstGoalId = goals.find((g: any) => g.status === "DRAFT" || g.status === "REWORK")?.id;
      const res = await fetch(`/api/goals/${firstGoalId}/submit`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error);
        return;
      }
      setSubmitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-500 text-sm mt-1">
            Weightage: {" "}
            <span className={`font-semibold ${totalWeightage === 100 ? "text-green-600" : totalWeightage > 100 ? "text-red-600" : "text-orange-600"}`}>
              {totalWeightage.toFixed(0)}%
            </span>
            {" / 100%"} • {goals.length}/8 goals
          </p>
        </div>
        <div className="flex gap-2">
          {hasDraftOrRework && (
            <button
              onClick={handleSubmit}
              disabled={!isReady || submitting}
              title={!isReady ? `Total must be 100% (currently ${totalWeightage.toFixed(0)}%)` : ""}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-200"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit for Approval"}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Goal"}
          </button>
        </div>
      </div>

      {/* Success / Error Messages */}
      {submitSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
          ✅ Goals submitted for manager approval. You&apos;ll be notified once approved.
        </div>
      )}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {submitError}
        </div>
      )}

      {/* Weightage Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Total Weightage</span>
          <span className={totalWeightage === 100 ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
            {totalWeightage.toFixed(0)}% {totalWeightage === 100 ? "✓ Ready to submit" : `(need ${(100 - totalWeightage).toFixed(0)}% more)`}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalWeightage > 100 ? "bg-red-500" : totalWeightage === 100 ? "bg-green-500" : "bg-violet-500"
            }`}
            style={{ width: `${Math.min(totalWeightage, 100)}%` }}
          />
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h2>
          <GoalForm
            existingTotalWeightage={totalWeightage}
            existingGoals={goals.map((g: any) => ({ title: g.title, weightage: g.weightage }))}
            department={session?.user?.department}
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ["goals"] });
            }}
          />
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No goals yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create up to 8 goals with total weightage of 100%</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-all"
          >
            + Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal: any) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => router.push(`/employee/goals/${goal.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
