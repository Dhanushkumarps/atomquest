"use client";

import { useState } from "react";
import type { GoalSuggestion } from "@/types";
import { Sparkles, X, Plus, Loader2 } from "lucide-react";

interface AiGoalSuggestionsProps {
  department?: string | null;
  existingGoals: Array<{ title: string; weightage: number }>;
  onApply: (suggestion: GoalSuggestion) => void;
  onClose: () => void;
}

const UOM_LABELS: Record<string, string> = {
  NUMERIC_MIN: "📈 Numeric Min",
  NUMERIC_MAX: "📉 Numeric Max",
  TIMELINE: "📅 Timeline",
  ZERO: "⚡ Zero Target",
};

export function AiGoalSuggestions({
  department,
  existingGoals,
  onApply,
  onClose,
}: AiGoalSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: department || "General",
          role: "Employee",
          existingGoals,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSuggestions(json.suggestions);
      setFetched(true);
    } catch (err: any) {
      setError(err.message || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 border border-violet-200 rounded-xl bg-gradient-to-b from-violet-50 to-purple-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-semibold text-violet-900">AI Goal Assistant</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-violet-700 mb-3">
        Get SMART goal suggestions from Claude AI tailored to your{" "}
        <strong>{department || "department"}</strong>.
      </p>

      {!fetched && (
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get AI Suggestions
            </>
          )}
        </button>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
          {error}
          <button
            onClick={fetchSuggestions}
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      {fetched && (
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="w-full text-xs text-violet-600 hover:text-violet-800 mb-3 flex items-center justify-center gap-1"
        >
          <Loader2 className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh suggestions
        </button>
      )}

      <div className="space-y-3 mt-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-violet-100 p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="text-xs font-medium text-violet-600 mb-0.5">{s.thrustArea}</div>
                <div className="text-sm font-semibold text-gray-900 leading-tight">{s.title}</div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>{UOM_LABELS[s.uom]}</span>
                  <span>Target: {s.suggestedTarget}</span>
                  <span>Weight: {s.weightageSuggestion}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onApply(s)}
              className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded text-xs font-medium transition-all"
            >
              <Plus className="w-3 h-3" />
              Use this goal
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
