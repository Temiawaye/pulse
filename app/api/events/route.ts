import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { eventSchema, parseBearer } from "@/lib/events/validation";

const MAX_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) return reply({ error: "Payload too large" }, 413);
  const key = parseBearer(request.headers.get("authorization"));
  if (!key) return reply({ error: "Invalid API key" }, 401);
  let text: string; try { text = await request.text(); } catch { return reply({ error: "Unable to read payload" }, 400); }
  if (new TextEncoder().encode(text).byteLength > MAX_BYTES) return reply({ error: "Payload too large" }, 413);
  let body: unknown; try { body = JSON.parse(text); } catch { return reply({ error: "Malformed JSON" }, 400); }
  const parsed = eventSchema.safeParse(body); if (!parsed.success) return reply({ error: "Invalid event", details: parsed.error.flatten().fieldErrors }, 422);
  const hash = createHash("sha256").update(key).digest("hex"); const admin = createAdminClient();
  const { data: allowed, error: rateError } = await admin.rpc("check_ingestion_rate", { p_key_hash: hash, p_limit: 120 });
  if (rateError) return reply({ error: "Ingestion unavailable" }, 503); if (!allowed) return reply({ error: "Rate limit exceeded" }, 429, { "Retry-After": "60" });
  const { data: project } = await admin.from("projects").select("id,public_id,environment").eq("api_key_hash", hash).maybeSingle();
  if (!project) return reply({ error: "Invalid API key" }, 401);
  if (parsed.data.projectId && parsed.data.projectId !== project.public_id) return reply({ error: "Project ID does not match API key" }, 403);
  if (parsed.data.environment && parsed.data.environment !== project.environment) return reply({ error: "Environment does not match project" }, 422);
  const { data: event, error } = await admin.from("monitoring_events").insert({ project_id: project.id, method: parsed.data.method, path: parsed.data.path, status_code: parsed.data.statusCode, response_time: parsed.data.responseTime, occurred_at: parsed.data.timestamp ?? new Date().toISOString(), user_agent: parsed.data.userAgent ?? null, region: parsed.data.region ?? null, metadata: parsed.data.metadata ?? {} }).select("id").single();
  if (error) return reply({ error: "Event could not be stored" }, 500);
  return reply({ accepted: true, eventId: event.id }, 202);
}

function reply(body: object, status: number, headers?: HeadersInit) { return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } }); }
