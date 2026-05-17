import { generateCheckinSummary } from "@/lib/groq";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Accepts either legacy { employeeName, goals[] } or new { goalTitle, planned, actual }
  const body = await req.json();

  try {
    let summary: string;

    if (body.goalTitle !== undefined) {
      // New single-goal format
      summary = await generateCheckinSummary(body.goalTitle, body.planned ?? 0, body.actual ?? 0);
    } else {
      // Legacy multi-goal format: build a combined comment from the first goal or a summary
      const goals: Array<{ title: string; progressScore: number | null }> =
        body.goals ?? [];
      const topGoal = goals[0];
      if (!topGoal) {
        return NextResponse.json({ summary: "No goal data provided." });
      }
      summary = await generateCheckinSummary(
        topGoal.title,
        100,
        topGoal.progressScore ?? 0
      );
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
