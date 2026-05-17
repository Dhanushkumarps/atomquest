import { suggestGoals } from "@/lib/groq";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { department, role, existingGoals } = await req.json();

  try {
    const suggestions = await suggestGoals(
      department || session.user.department || "General",
      role || session.user.role,
      existingGoals || []
    );
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
