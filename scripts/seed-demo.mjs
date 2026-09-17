const baseUrl = process.env.PULSE_URL ?? "http://localhost:3000";
const key = process.env.PULSE_API_KEY;
if (!key) { console.error("Set PULSE_API_KEY to a project's one-time ingestion key."); process.exit(1); }
const endpoints = ["/api/users", "/api/projects", "/api/checkout", "/health", "/dashboard"];
const methods = ["GET", "GET", "POST", "GET", "GET"];
for (let i = 0; i < 40; i++) {
  const index = i % endpoints.length; const statusCode = i % 17 === 0 ? 500 : i % 9 === 0 ? 404 : 200;
  const response = await fetch(`${baseUrl}/api/events`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ method: methods[index], path: endpoints[index], statusCode, responseTime: 45 + ((i * 47) % 640), timestamp: new Date(Date.now() - (39 - i) * 90_000).toISOString(), metadata: { source: "pulse-demo-seed", demo: true } }) });
  if (!response.ok) { console.error(`Event ${i + 1} failed: ${response.status} ${await response.text()}`); process.exit(1); }
}
console.log("Created 40 events marked as demo data.");
