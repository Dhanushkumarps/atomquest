"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface QoQTrendChartProps {
  data: Array<{ quarter: string; avgScore: number; completionRate: number }>;
}

export function QoQTrendChart({ data }: QoQTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="avgScore"
          name="Avg Achievement"
          stroke="#534AB7"
          strokeWidth={2.5}
          dot={{ fill: "#534AB7", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="completionRate"
          name="Completion Rate"
          stroke="#0F6E56"
          strokeWidth={2.5}
          dot={{ fill: "#0F6E56", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
