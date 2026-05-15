import { z } from "zod";

export const ErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string(),
  }),
});

export type ErrorBody = z.infer<typeof ErrorBodySchema>;

export class StormError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(args: { code: string; message: string; status: number; details?: unknown }) {
    super(args.message);
    this.name = "StormError";
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
  }
}
