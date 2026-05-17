"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, type GoalInput } from "@/lib/validations/goal-schema";
import { useState } from "react";
import { AiGoalSuggestions } from "./AiGoalSuggestions";
import type { GoalSuggestion } from "@/types";

interface GoalFormProps {
  onSuccess: () => void;
  initialData?: Partial<GoalInput>;
  goalId?: string;
  existingTotalWeightage?: number;
  existingGoals?: Array<{ title: string; weightage: number }>;
  department?: string | null;
  isSharedReadOnly?: boolean;
}

const UOM_OPTIONS = [
  { value: "NUMERIC_MIN", label: "📈 Numeric Min (Higher is better)" },
  { value: "NUMERIC_MAX", label: "📉 Numeric Max (Lower is better)" },
  { value: "TIMELINE", label: "📅 Timeline (Date-based)" },
  { value: "ZERO", label: "⚡ Zero Target (Zero = 100% success)" },
];

export function GoalForm({
  onSuccess,
  initialData,
  goalId,
  existingTotalWeightage = 0,
  existingGoals = [],
  department,
  isSharedReadOnly = false,
}: GoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: initialData,
  });

  const currentWeightage = watch("weightage") || 0;
  const remainingWeightage = 100 - existingTotalWeightage;
  const projectedTotal = existingTotalWeightage + (Number(currentWeightage) || 0);
  const isOverBudget = projectedTotal > 100;

  const onSubmit = async (data: GoalInput) => {
    setLoading(true);
    setError(null);

    try {
      const url = goalId ? `/api/goals/${goalId}` : "/api/goals";
      const method = goalId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.formErrors?.[0] || json.error || "Failed to save goal");
        return;
      }

      onSuccess();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionApply = (suggestion: GoalSuggestion) => {
    setValue("thrustArea", suggestion.thrustArea);
    setValue("title", suggestion.title);
    setValue("description", suggestion.description);
    setValue("uom", suggestion.uom);
    setValue("target", suggestion.suggestedTarget);
    setValue("weightage", Math.min(suggestion.weightageSuggestion, remainingWeightage));
    setShowAI(false);
  };

  return (
    <div className="flex gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thrust Area <span className="text-red-500">*</span>
            </label>
            <input
              {...register("thrustArea")}
              disabled={isSharedReadOnly}
              placeholder="e.g. Revenue Growth, Customer Success"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
            {errors.thrustArea && (
              <p className="mt-1 text-xs text-red-500">{errors.thrustArea.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit of Measurement <span className="text-red-500">*</span>
            </label>
            <select
              {...register("uom")}
              disabled={isSharedReadOnly}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select UoM</option>
              {UOM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.uom && <p className="mt-1 text-xs text-red-500">{errors.uom.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goal Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            disabled={isSharedReadOnly}
            placeholder="e.g. Achieve Q4 Revenue Target of ₹50L"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description")}
            disabled={isSharedReadOnly}
            rows={3}
            placeholder="Describe the goal in detail, including how success will be measured..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-500"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Value <span className="text-red-500">*</span>
            </label>
            <input
              {...register("target", { valueAsNumber: true })}
              type="number"
              step="any"
              disabled={isSharedReadOnly}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
            {errors.target && <p className="mt-1 text-xs text-red-500">{errors.target.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weightage (%) <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-400">Available: {remainingWeightage}%</span>
            </label>
            <input
              {...register("weightage", { valueAsNumber: true })}
              type="number"
              min={10}
              max={100}
              placeholder="Min 10%"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                ${isOverBudget ? "border-red-300 bg-red-50" : "border-gray-200"}`}
            />
            {errors.weightage && (
              <p className="mt-1 text-xs text-red-500">{errors.weightage.message}</p>
            )}

            {/* Weightage Meter */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Total after adding: {projectedTotal.toFixed(0)}%</span>
                <span className={isOverBudget ? "text-red-600 font-medium" : "text-green-600"}>
                  {isOverBudget ? "⚠️ Over 100%!" : "✓ OK"}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverBudget ? "bg-red-500" : projectedTotal === 100 ? "bg-green-500" : "bg-violet-500"
                  }`}
                  style={{ width: `${Math.min(projectedTotal, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {!isSharedReadOnly && (
            <button
              type="button"
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2 px-4 py-2 border border-violet-200 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 transition-all"
            >
              ✨ AI Goal Suggestions
            </button>
          )}

          <button
            type="submit"
            disabled={loading || isOverBudget}
            className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : goalId ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </form>

      {showAI && (
        <AiGoalSuggestions
          department={department}
          existingGoals={existingGoals}
          onApply={handleSuggestionApply}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
