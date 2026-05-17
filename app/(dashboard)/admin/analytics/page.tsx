"use client";

import { useQuery } from "@tanstack/react-query";
import { QoQTrendChart } from "@/components/analytics/QoQTrendChart";
import { GoalDistribution } from "@/components/analytics/GoalDistribution";

export default function AdminAnalyticsPage() {
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["qoq-trends"],
    queryFn: () => fetch("/api/analytics/qoq-trends").then((r) => r.json()),
  });

  const { data: distData, isLoading: distLoading } = useQuery({
    queryKey: ["goal-distribution"],
    queryFn: () => fetch("/api/analytics/goal-distribution").then((r) => r.json()),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Organization-wide performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QoQ Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Quarter-over-Quarter Trends</h2>
          <p className="text-xs text-gray-400 mb-4">Achievement score and completion rate by quarter</p>
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
            </div>
          ) : trendData?.data?.length > 0 ? (
            <QoQTrendChart data={trendData.data} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
              No achievement data yet
            </div>
          )}
        </div>

        {/* Goal Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Goal Status Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Current cycle goal status breakdown</p>
          {distLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
            </div>
          ) : distData?.data?.length > 0 ? (
            <GoalDistribution data={distData.data} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
              No goal data yet
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trendData?.data?.map((q: any) => (
          <div key={q.quarter} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">{q.quarter} Performance</div>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold text-violet-600">{q.avgScore}%</div>
                <div className="text-xs text-gray-400">Avg Achievement</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{q.completionRate}%</div>
                <div className="text-xs text-gray-400">Completion Rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
