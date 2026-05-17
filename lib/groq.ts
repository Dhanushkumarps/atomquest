import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function suggestGoals(
  department: string,
  role: string,
  existingGoals: Array<{ title: string }>
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are an expert HR consultant helping employees set SMART goals.

Department: ${department}
Role: ${role}
Existing goals already set: ${existingGoals.map((g) => g.title).join(", ") || "none"}

Suggest 3 specific, measurable goals for this employee that:
1. Align with typical ${department} department KPIs
2. Are different from their existing goals
3. Include a suggested target value and unit of measurement

Respond ONLY with a JSON array (no markdown, no explanation):
[
  {
    "thrustArea": "string",
    "title": "string",
    "description": "string",
    "uom": "NUMERIC_MIN",
    "suggestedTarget": 100,
    "weightageSuggestion": 20
  }
]`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = response.choices[0]?.message?.content ?? "[]";
  // Strip any accidental markdown fences before parsing
  const cleaned = text.replace(/```json?/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function generateCheckinSummary(
  goalTitle: string,
  planned: number,
  actual: number
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are a manager writing a constructive quarterly check-in comment.

Goal: ${goalTitle}
Planned target: ${planned}
Actual achieved: ${actual}
Achievement rate: ${planned > 0 ? ((actual / planned) * 100).toFixed(1) : 0}%

Write a brief (2-3 sentences), professional, and encouraging check-in comment that:
1. Acknowledges the performance level
2. Gently flags areas needing attention if below target
3. Provides actionable encouragement

Respond with ONLY the comment text, no extra formatting.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content ?? "";
}
