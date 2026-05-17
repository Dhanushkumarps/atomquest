export function computeProgressScore(
  uom: "NUMERIC_MIN" | "NUMERIC_MAX" | "TIMELINE" | "ZERO",
  target: number,
  actual: number,
  deadline?: Date,
  completionDate?: Date
): number {
  switch (uom) {
    case "NUMERIC_MIN":
      // Higher is better (e.g. sales revenue)
      return Math.min((actual / target) * 100, 150);

    case "NUMERIC_MAX":
      // Lower is better (e.g. TAT, cost)
      if (actual === 0) return 100;
      return Math.min((target / actual) * 100, 150);

    case "TIMELINE":
      // Date-based completion
      if (!deadline || !completionDate) return 0;
      if (completionDate <= deadline) return 100;
      const daysLate =
        (completionDate.getTime() - deadline.getTime()) / 86400000;
      return Math.max(0, 100 - daysLate * 5); // -5% per day late

    case "ZERO":
      // Zero = success (e.g. safety incidents)
      return actual === 0 ? 100 : 0;

    default:
      return 0;
  }
}

export function computeWeightedScore(
  goals: Array<{ weightage: number; progressScore: number | null }>
): number {
  const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (totalWeight === 0) return 0;

  const weighted = goals.reduce(
    (sum, g) => sum + (g.progressScore ?? 0) * g.weightage,
    0
  );
  return weighted / totalWeight;
}
