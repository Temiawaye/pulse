import { z } from "zod";

const blockedMetadataKey = /(authorization|cookie|password|secret|token|api[-_]?key|body)/i;
export const eventSchema = z.object({
  projectId: z.string().regex(/^prj_[A-Za-z0-9_-]{8,}$/).optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  path: z.string().min(1).max(2048).startsWith("/"),
  statusCode: z.number().int().min(100).max(599),
  responseTime: z.number().int().min(0).max(3_600_000),
  timestamp: z.string().datetime({ offset: true }).optional(),
  userAgent: z.string().max(512).optional(),
  region: z.string().max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional().refine((value) => !value || Object.keys(value).every((key) => !blockedMetadataKey.test(key)), "Metadata contains a sensitive field name"),
  environment: z.enum(["production", "staging", "development"]).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.timestamp) { const date = new Date(value.timestamp); const now = Date.now(); if (date.getTime() > now + 5 * 60_000 || date.getTime() < now - 31 * 86_400_000) ctx.addIssue({ code: "custom", path: ["timestamp"], message: "Timestamp is outside the accepted window" }); }
});

export type EventInput = z.infer<typeof eventSchema>;

export function parseBearer(header: string | null) {
  const match = header?.match(/^Bearer\s+(pulse_live_[A-Za-z0-9_-]{20,})$/);
  return match?.[1] ?? null;
}
