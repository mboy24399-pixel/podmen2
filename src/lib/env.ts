import { z } from "zod";

const serverEnvSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
});

export function validateEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid server environment variables:", parsed.error.format());
    // Only throw in true server runtime where we expect these variables to exist and be valid
    // We don't throw during build time just in case Next.js requires it
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE?.includes("build")) {
      throw new Error("Invalid server environment variables");
    }
  }
}
