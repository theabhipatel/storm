/**
 * Storm error code catalog.
 *
 * Format: SCOPE_REASON (upper-snake). Codes are stable once shipped;
 * frontends switch on them. Add new codes here as services come online.
 */
export const ErrorCodes = {
  // Generic — usable across services
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  IDEMPOTENCY_KEY_REUSE: "IDEMPOTENCY_KEY_REUSE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
