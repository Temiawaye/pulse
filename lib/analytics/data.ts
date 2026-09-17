import "server-only";
import { requireUser } from "@/lib/auth";
import { getRange } from "@/lib/constants";
import type { ChartPoint, Metrics, MonitoringEvent } from "@/lib/types";

export interface AnalyticsFilters { project?: string; range?: string; status?: string; endpoint?: string }

export async function getAnalytics(filters: AnalyticsFilters) {
  const { supabase } = await requireUser(); const range = getRange(filters.range); const since = new Date(Date.now() - range.minutes * 60_000).toISOString();
  const args = { p_project: filters.project || null, p_since: since, p_status: filters.status || null, p_endpoint: filters.endpoint || null };
  const [metricResult, seriesResult, recentResult, endpointsResult, uptimeResult] = await Promise.all([
    supabase.rpc("filtered_metrics", args),
    supabase.rpc("filtered_timeseries", { ...args, p_bucket_minutes: range.bucketMinutes }),
    supabase.from("monitoring_events").select("id,project_id,method,path,status_code,response_time,user_agent,region,metadata,occurred_at,created_at,project:projects(name,public_id)").gte("occurred_at", since).order("occurred_at", { ascending: false }).limit(20).match(filters.project ? { project_id: filters.project } : {}),
    supabase.rpc("endpoint_performance", { p_project: filters.project || null, p_since: since, p_limit: 5 }),
    supabase.from("uptime_checks").select("is_up").gte("checked_at", since).match(filters.project ? { project_id: filters.project } : {}),
  ]);
  const failure = [metricResult, seriesResult, recentResult, endpointsResult, uptimeResult].find((result) => result.error); if (failure?.error) throw new Error("Unable to load monitoring data.");
  const row = metricResult.data?.[0] ?? {};
  const metrics: Metrics = { totalRequests: Number(row.total_requests ?? 0), averageLatency: Number(row.average_latency ?? 0), errorRate: Number(row.error_rate ?? 0), serverErrorRate: Number(row.server_error_rate ?? 0), successfulRequests: Number(row.successful_requests ?? 0), clientErrors: Number(row.client_errors ?? 0), serverErrors: Number(row.server_errors ?? 0), requestsPerMinute: Number(row.total_requests ?? 0) / range.minutes };
  const chart: ChartPoint[] = (seriesResult.data ?? []).map((point: { bucket: string; requests: number; average_latency: number; errors: number }) => ({ bucket: point.bucket, requests: Number(point.requests), averageLatency: Number(point.average_latency), errors: Number(point.errors) }));
  const checks = uptimeResult.data ?? []; const uptime = checks.length ? (checks.filter((check) => check.is_up).length / checks.length) * 100 : null;
  return { metrics, chart, recent: (recentResult.data ?? []) as unknown as MonitoringEvent[], endpoints: endpointsResult.data ?? [], uptime, range };
}
