"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

export default function ManagerCheckinsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => fetch("/api/goals").then((r) => r.json()),
  });

  const goals = data?.goals || [];
  
  // Group by employee
  const byEmployee: Record<string, { user: any; goals: any[] }> = {};
  goals.forEach((g: any) => {
    const uid = g.user.id;
    if (!byEmployee[uid]) byEmployee[uid] = { user: g.user, goals: [] };
    byEmployee[uid].goals.push(g);
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Check-ins</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor and add quarterly check-in comments for your team</p>
      </div>

      <div className="space-y-4">
        {Object.values(byEmployee).map((group) => {
          const lockedGoals = group.goals.filter((g) => g.status === "LOCKED");
          const hasAchievements = lockedGoals.some((g) => g.achievements?.length > 0);
          
          return (
            <div key={group.user.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {group.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{group.user.name}</div>
                  <div className="text-xs text-gray-400">{group.user.department}</div>
                  <div className="text-xs mt-0.5">
                    <span className="text-gray-500">{lockedGoals.length} approved goals</span>
                    {hasAchievements && <span className="ml-2 text-green-600">• Has achievements logged</span>}
                  </div>
                </div>
              </div>
              <Link
                href={`/manager/checkins/${group.user.id}`}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
              >
                View & Check-in →
              </Link>
            </div>
          );
        })}
        {Object.keys(byEmployee).length === 0 && (
          <div className="text-center py-12 text-gray-400">No team members with goals in this cycle.</div>
        )}
      </div>
    </div>
  );
}
