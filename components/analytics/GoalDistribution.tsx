"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GoalDistributionProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#3b82f6",
  APPROVED: "#10b981",
  REWORK: "#ef4444",
  LOCKED: "#8b5cf6",
};

const LABEL_MAP: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REWORK: "Rework",
  LOCKED: "Locked",
};

export function GoalDistribution({ data }: GoalDistributionProps) {
  const formattedData = data.map((d) => ({
    ...d,
    name: LABEL_MAP[d.name] || d.name,
    originalName: d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {formattedData.map((entry, i) => (
            <Cell
              key={i}
              fill={COLORS[entry.originalName] || "#6366f1"}
            />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [Number(v), "Goals"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
