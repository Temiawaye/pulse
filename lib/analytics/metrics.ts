import type { Metrics, MonitoringEvent } from "@/lib/types";

export function calculateMetrics(events: Pick<MonitoringEvent, "status_code" | "response_time">[], windowMinutes: number): Metrics {
  const totalRequests = events.length; const clientErrors = events.filter((e) => e.status_code >= 400 && e.status_code < 500).length; const serverErrors = events.filter((e) => e.status_code >= 500).length;
  return { totalRequests, averageLatency: totalRequests ? events.reduce((sum, event) => sum + event.response_time, 0) / totalRequests : 0, errorRate: totalRequests ? ((clientErrors + serverErrors) / totalRequests) * 100 : 0, serverErrorRate: totalRequests ? (serverErrors / totalRequests) * 100 : 0, successfulRequests: totalRequests - clientErrors - serverErrors, clientErrors, serverErrors, requestsPerMinute: windowMinutes > 0 ? totalRequests / windowMinutes : 0 };
}

export function mergeUniqueEvents(current: MonitoringEvent[], incoming: MonitoringEvent[], limit = 50) {
  const map = new Map(current.map((event) => [event.id, event])); incoming.forEach((event) => map.set(event.id, event));
  return [...map.values()].sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at)).slice(0, limit);
}

export function isInTimeWindow(timestamp: string, now: Date, minutes: number) {
  const value = Date.parse(timestamp);
  return Number.isFinite(value) && value >= now.getTime() - minutes * 60_000 && value <= now.getTime();
}
