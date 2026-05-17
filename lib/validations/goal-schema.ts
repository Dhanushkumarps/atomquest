// Pure Zod schemas — no server imports, safe to use in Client Components
import { z } from "zod";

export const goalSchema = z.object({
  thrustArea: z.string().min(1, "Thrust area required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description too long"),
  uom: z.enum(["NUMERIC_MIN", "NUMERIC_MAX", "TIMELINE", "ZERO"]),
  target: z.number().positive("Target must be positive"),
  weightage: z.number().min(10, "Minimum 10%").max(100, "Maximum 100%"),
});

export type GoalInput = z.infer<typeof goalSchema>;
