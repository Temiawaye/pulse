import { describe, expect, it } from "vitest";
import { eventSchema, parseBearer } from "./validation";

describe("event validation", () => {
  it("accepts a valid event", () => expect(eventSchema.safeParse({ method: "GET", path: "/health", statusCode: 200, responseTime: 12 }).success).toBe(true));
  it("rejects malformed and sensitive payloads", () => { expect(eventSchema.safeParse({ method: "TRACE", path: "health", statusCode: 999, responseTime: -1 }).success).toBe(false); expect(eventSchema.safeParse({ method: "POST", path: "/login", statusCode: 200, responseTime: 1, metadata: { authorization: "secret" } }).success).toBe(false); });
  it("requires the Pulse bearer key format", () => { expect(parseBearer("Bearer pulse_live_abcdefghijklmnopqrstuvwxyz")).toContain("pulse_live_"); expect(parseBearer("Basic secret")).toBeNull(); });
});
