"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export default function MemberCheckinPage() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: goalsData } = useQuery({
    queryKey: ["goals-user", userId],
    queryFn: () => fetch("/api/goals").then((r) => r.json()),
  });

  const goals = (goalsData?.goals || []).filter(
    (g: any) => g.user.id === userId && g.status === "LOCKED"
  );
  const user = goals[0]?.user;

  const handleCheckin = async (goalId: string, quarter: string) => {
    const key = `${goalId}-${quarter}`;
    if (!comments[key]?.trim()) return;
    setSaving(key);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, quarter, comment: comments[key] }),
      });
      if (res.ok) {
        setSuccess(`Check-in saved for ${quarter}!`);
        setComments((prev) => ({ ...prev, [key]: "" }));
        queryClient.invalidateQueries({ queryKey: ["goals-user", userId] });
      }
    } finally { setSaving(null); }
  };

  const generateAiSummary = async () => {
    setAiLoading(true);
    try {
      const newComments = { ...comments };
      const fetchPromises: Promise<void>[] = [];

      for (const goal of goals) {
        // Generate summaries for all quarters that have an achievement
        for (const q of QUARTERS) {
          const achievement = goal.achievements?.find((a: any) => a.quarter === q);
          if (!achievement || achievement.progressScore === null) continue;

          const key = `${goal.id}-${q}`;
          if (newComments[key]?.trim()) continue; // Skip if manager already typed something

          const p = fetch("/api/ai/checkin-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goalTitle: goal.title,
              planned: goal.target,
              actual: achievement.actual ?? achievement.progressScore,
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.summary) {
                newComments[key] = json.summary.replace(/^"|"$/g, "").trim();
              }
            })
            .catch((err) => console.error("AI Error:", err));

          fetchPromises.push(p);
        }
      }

      await Promise.all(fetchPromises);
      setComments(newComments);
    } catch (err) {
      console.error("Failed to generate AI summaries", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/manager/checkins" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Check-in: {user?.name || "Team Member"}
          </h1>
          <p className="text-gray-500 text-sm">{user?.email} • {user?.department}</p>
        </div>
        <button
          onClick={generateAiSummary}
          disabled={aiLoading || goals.length === 0}
          className="ml-auto flex items-center gap-2 px-4 py-2 border border-violet-200 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {aiLoading ? "Generating..." : "AI Summary"}
        </button>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">{success}</div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No approved goals for this employee.</div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal: any) => (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-50">
                <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-medium">{goal.thrustArea}</span>
                <h3 className="font-semibold text-gray-900 mt-1">{goal.title}</h3>
                <p className="text-xs text-gray-500">Target: {goal.target} • Weight: {goal.weightage}%</p>
              </div>

              {/* Quarter grid */}
              <div className="grid grid-cols-2 md:grid-cols-4">
                {QUARTERS.map((q) => {
                  const achievement = goal.achievements?.find((a: any) => a.quarter === q);
                  const key = `${goal.id}-${q}`;
                  return (
                    <div key={q} className="p-4 border-r border-b border-gray-50 last:border-r-0">
                      <div className="text-xs font-medium text-gray-500 mb-2">{q}</div>
                      {achievement ? (
                        <div className="mb-2">
                          <div className="text-lg font-bold text-gray-900">
                            {achievement.progressScore !== null ? `${achievement.progressScore.toFixed(0)}%` : "—"}
                          </div>
                          <div className="text-xs text-gray-400">Actual: {achievement.actual ?? "—"}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-300 mb-2">No achievement yet</div>
                      )}
                      <textarea
                        value={comments[key] || ""}
                        onChange={(e) => setComments((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Add check-in comment..."
                        rows={2}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none"
                      />
                      <button
                        onClick={() => handleCheckin(goal.id, q)}
                        disabled={saving === key || !comments[key]?.trim()}
                        className="mt-1 w-full py-1 bg-violet-600 text-white rounded text-xs font-medium hover:bg-violet-700 transition-all disabled:opacity-40"
                      >
                        {saving === key ? "..." : "Save"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
