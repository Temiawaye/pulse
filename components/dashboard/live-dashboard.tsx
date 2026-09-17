"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Clock3, Gauge, Radio, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { mergeUniqueEvents } from "@/lib/analytics/metrics";
import { formatDate, formatNumber } from "@/lib/utils";
import type { ChartPoint, Metrics, MonitoringEvent } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { MonitoringChart } from "@/components/charts/monitoring-chart";
import { EmptyState } from "@/components/ui/empty-state";

type Connection = "connecting" | "live" | "reconnecting" | "disconnected";
export function LiveDashboard({ metrics, chart, recent: initialRecent, uptime, projectId }: { metrics: Metrics; chart: ChartPoint[]; recent: MonitoringEvent[]; uptime: number | null; projectId?: string }) {
  const [recent, setRecent] = useState(initialRecent); const [connection, setConnection] = useState<Connection>("connecting"); const [updated, setUpdated] = useState(new Date()); const router = useRouter(); const refreshTimer = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    const supabase = createClient(); let active = true; const filter = projectId ? { event: "INSERT" as const, schema: "public", table: "monitoring_events", filter: `project_id=eq.${projectId}` } : { event: "INSERT" as const, schema: "public", table: "monitoring_events" };
    const reconcile = () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); refreshTimer.current = setTimeout(() => { if (active) { router.refresh(); setUpdated(new Date()); } }, 1200); };
    const channel = supabase.channel(`events:${projectId ?? "all"}`).on("postgres_changes", filter, (payload) => { if (!active) return; setRecent((current) => mergeUniqueEvents(current, [payload.new as MonitoringEvent], 20)); setUpdated(new Date()); reconcile(); }).subscribe((status) => { if (!active) return; if (status === "SUBSCRIBED") { setConnection("live"); reconcile(); } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnection("reconnecting"); else if (status === "CLOSED") setConnection("disconnected"); });
    const interval = setInterval(reconcile, 60_000);
    return () => { active = false; clearInterval(interval); if (refreshTimer.current) clearTimeout(refreshTimer.current); void supabase.removeChannel(channel); };
  }, [projectId, router]);
  return <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Activity} label="Total requests" value={formatNumber(metrics.totalRequests)} /><Metric icon={Clock3} label="Average latency" value={`${Math.round(metrics.averageLatency)} ms`} /><Metric icon={TriangleAlert} label="Error rate" value={`${metrics.errorRate.toFixed(1)}%`} /><Metric icon={Gauge} label="Uptime" value={uptime === null ? "Not configured" : `${uptime.toFixed(2)}%`} small={uptime === null} /></div>
    <Card className="mt-4 p-4 md:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Request volume</h2><p className="text-xs text-[var(--muted)]">Persisted events in the selected window</p></div><div className="text-right"><span className="inline-flex items-center gap-1.5 text-xs capitalize text-[var(--muted)]"><Radio className={connection === "live" ? "h-3.5 w-3.5 text-[var(--accent)]" : "h-3.5 w-3.5 text-[var(--warning)]"} />{connection}</span><p className="text-[11px] text-[var(--muted)]">Updated {updated.toLocaleTimeString()}</p></div></div>{chart.length ? <MonitoringChart data={chart} /> : <EmptyState title="No monitoring events yet" description="Send your first server-side event to populate live analytics." />}</Card>
    <Card className="mt-4 overflow-hidden"><div className="border-b px-5 py-4"><h2 className="font-semibold">Recent requests</h2></div>{recent.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs text-[var(--muted)]"><tr><th className="px-5 py-3 font-medium">Method</th><th className="px-3 py-3 font-medium">Endpoint</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Duration</th><th className="px-5 py-3 text-right font-medium">Time</th></tr></thead><tbody>{recent.map((event) => <tr key={event.id} className="border-t motion-safe:animate-[fade-in_.2s_ease-out]"><td className="px-5 py-3 font-mono text-xs">{event.method}</td><td className="max-w-72 truncate px-3 py-3 font-mono text-xs">{event.path}</td><td className="px-3 py-3 font-mono text-xs">{event.status_code}</td><td className="px-3 py-3 font-mono text-xs">{event.response_time}ms</td><td className="px-5 py-3 text-right text-xs text-[var(--muted)]">{formatDate(event.occurred_at)}</td></tr>)}</tbody></table></div> : <EmptyState title="No requests in this window" description="Incoming events will appear here without a refresh." />}</Card></>;
}
function Metric({ icon: Icon, label, value, small }: { icon: typeof Activity; label: string; value: string; small?: boolean }) { return <Card className="p-5"><div className="flex items-center justify-between text-sm text-[var(--muted)]"><span>{label}</span><Icon className="h-4 w-4" aria-hidden /></div><p className={small ? "mt-4 text-xl font-semibold" : "mt-4 font-mono text-3xl font-semibold"}>{value}</p></Card>; }
