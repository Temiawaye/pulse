import { describe, expect, it } from "vitest";
import { calculateMetrics, isInTimeWindow, mergeUniqueEvents } from "./metrics";
import type { MonitoringEvent } from "@/lib/types";

describe("metrics", () => {
  it("returns finite zeroes for an empty dataset", () => expect(calculateMetrics([], 60)).toEqual({ totalRequests: 0, averageLatency: 0, errorRate: 0, serverErrorRate: 0, successfulRequests: 0, clientErrors: 0, serverErrors: 0, requestsPerMinute: 0 }));
  it("calculates status classes and latency", () => { const result = calculateMetrics([{ status_code: 200, response_time: 100 }, { status_code: 404, response_time: 200 }, { status_code: 500, response_time: 300 }], 60); expect(result.averageLatency).toBe(200); expect(result.errorRate).toBeCloseTo(66.67); expect(result.serverErrorRate).toBeCloseTo(33.33); });
  it("deduplicates realtime reconciliation by id", () => { const base = { project_id: "p", method: "GET", path: "/", status_code: 200, response_time: 1, user_agent: null, region: null, metadata: {}, created_at: "2026-01-01T00:00:00Z" }; const a = { ...base, id: "a", occurred_at: "2026-01-01T00:00:00Z" } as MonitoringEvent; const newer = { ...a, occurred_at: "2026-01-01T01:00:00Z" }; expect(mergeUniqueEvents([a], [newer])).toEqual([newer]); });
  it("handles exact time boundaries", () => { const now = new Date("2026-09-17T12:00:00Z"); expect(isInTimeWindow("2026-09-17T11:00:00Z", now, 60)).toBe(true); expect(isInTimeWindow("2026-09-17T10:59:59Z", now, 60)).toBe(false); expect(isInTimeWindow("2026-09-17T12:00:01Z", now, 60)).toBe(false); });
});
