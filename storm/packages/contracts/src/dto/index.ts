/**
 * REST DTO schemas. Filled in as endpoints come online.
 */
import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ReadyResponseSchema = z.object({
  status: z.literal("ready"),
  checks: z.record(z.string(), z.enum(["ok", "fail"])).optional(),
});
export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;
