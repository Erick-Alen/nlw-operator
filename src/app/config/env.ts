import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
