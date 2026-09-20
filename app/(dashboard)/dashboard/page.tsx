import { Suspense } from "react";
import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectSelector, TimeRangeSelector } from "@/components/filters";
import { getAnalytics } from "@/lib/analytics/data";
import { getProjects } from "@/lib/projects";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ project?: string; range?: string }> }) {
  const filters = await searchParams;
  const projects = await getProjects();
  const data = await getAnalytics(filters);
  return (
  <>
  <PageHeader 
    title="Overview" 
    description="Live performance across your monitored applications."
    actions={
    <div className="flex flex-wrap gap-2">
      <Suspense>
        <ProjectSelector projects={projects} value={filters.project} />
        <TimeRangeSelector value={filters.range} />
      </Suspense>
    </div>}
  /> 
  <LiveDashboard 
    key={
      `$
      {
        filters.project ?? "all"
      }:
      ${
        filters.range ?? "24h"
      }:
      ${
        data.recent[0]?.id ?? "empty"
      }`
    }
    {...data} projectId={filters.project} />
  </>
  );
}
