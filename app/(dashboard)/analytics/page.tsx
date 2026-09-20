import { Suspense } from "react";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { ErrorBars, MonitoringChart, StatusChart } from "@/components/charts/monitoring-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getAnalytics } from "@/lib/analytics/data";
import { getProjects } from "@/lib/projects";
import { formatNumber } from "@/lib/utils";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ project?: string; range?: string; status?: string; endpoint?: string }> }) {
  const filters = await searchParams;
  const [projects, data] = await Promise.all([getProjects(), getAnalytics(filters)]);
  const m = data.metrics;
  return (
    <>
      <PageHeader title="Analytics" description="Historical traffic, latency, and request outcomes." />
      <Suspense>
        <AnalyticsFilters projects={projects} filters={filters} />
      </Suspense>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Requests", formatNumber(m.totalRequests)],
          ["Requests / min", m.requestsPerMinute.toFixed(2)],
          ["Avg latency", `${Math.round(m.averageLatency)} ms`],
          ["Server error rate", `${m.serverErrorRate.toFixed(1)}%`]
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-[var(--muted)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-xl font-semibold">
              {value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Request volume">
          <MonitoringChart data={data.chart} />
        </Panel>
        <Panel title="Average response time">
          <MonitoringChart data={data.chart} metric="averageLatency" />
        </Panel>
        <Panel title="Request outcomes">
          <StatusChart metrics={m} />
          <p className="text-center text-xs text-[var(--muted)]">{m.successfulRequests} successful · {m.clientErrors} client errors · {m.serverErrors} server errors</p>
        </Panel>
        <Panel title="Error trend">
          <ErrorBars data={data.chart} />
        </Panel>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Slowest endpoints</h2>
        </div>

        <div className="divide-y">
          {data.endpoints.length ? (
            data.endpoints.map((item: { path: string; requests: number; average_latency: number }) => (
              <div key={item.path}
                className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 text-sm">
                <code className="truncate text-xs">
                  {item.path}
                </code>
                <span className="text-[var(--muted)]">
                  {item.requests} requests
                </span>
                <span className="font-mono text-xs">
                  {Math.round(item.average_latency)}ms avg
                </span>
              </div>
            ))
          ) : (
            <p className="p-5 text-sm text-[var(--muted)]">No endpoint data in this window.</p>
          )}
        </div>
      </Card>
    </>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
  <Card className="p-4 md:p-5">
    <h2 className="mb-3 font-semibold">{title}</h2>
    {children}
  </Card>
  );
}
