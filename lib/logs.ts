import "server-only";
import { requireUser } from "@/lib/auth";
import type { MonitoringEvent } from "@/lib/types";

export interface LogFilters { query?: string; method?: string; status?: string; project?: string; from?: string; to?: string; page?: string }
export async function getLogs(filters: LogFilters) {
  const { supabase } = await requireUser(); const page = Math.max(1, Number(filters.page) || 1); const pageSize = 25;
  let query = supabase.from("monitoring_events").select("id,project_id,method,path,status_code,response_time,user_agent,region,metadata,occurred_at,created_at,project:projects(name,public_id)", { count: "exact" });
  if (filters.query) query = query.ilike("path", `%${filters.query.replace(/[%_,()]/g, "")}%`);
  if (filters.method) query = query.eq("method", filters.method); if (filters.project) query = query.eq("project_id", filters.project);
  if (filters.status) { const base = Number(filters.status[0]) * 100; query = query.gte("status_code", base).lte("status_code", base + 99); }
  if (filters.from) query = query.gte("occurred_at", new Date(filters.from).toISOString()); if (filters.to) query = query.lte("occurred_at", new Date(filters.to).toISOString());
  const { data, count, error } = await query.order("occurred_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error("Unable to load request logs.");
  return { events: (data ?? []) as unknown as MonitoringEvent[], page, pageSize, total: count ?? 0, pages: Math.max(1, Math.ceil((count ?? 0) / pageSize)) };
}
