import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";
import { CreateProject } from "@/components/projects/create-project";
import { DeleteProject } from "@/components/projects/delete-project";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProjects } from "@/lib/projects";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <><PageHeader title="Projects" description="Applications sending monitoring data to Pulse." actions={<CreateProject />} />{projects.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <Card key={project.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{project.name}</h2><code className="text-xs text-[var(--muted)]">{project.public_id}</code></div><div className="flex items-center gap-1"><StatusBadge status={project.last_event_at ? "good" : "neutral"} label={project.last_event_at ? "Receiving data" : "No data"} /><DeleteProject id={project.id} name={project.name} /></div></div><dl className="mt-6 grid grid-cols-3 gap-3 text-sm"><div><dt className="text-xs text-[var(--muted)]">Today</dt><dd className="mt-1 font-mono">{formatNumber(project.metrics?.totalRequests ?? 0)}</dd></div><div><dt className="text-xs text-[var(--muted)]">Errors</dt><dd className="mt-1 font-mono">{(project.metrics?.errorRate ?? 0).toFixed(1)}%</dd></div><div><dt className="text-xs text-[var(--muted)]">Latency</dt><dd className="mt-1 font-mono">{Math.round(project.metrics?.averageLatency ?? 0)}ms</dd></div></dl><dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 text-sm"><div><dt className="text-xs text-[var(--muted)]">Environment</dt><dd className="mt-1 capitalize">{project.environment}</dd></div><div><dt className="text-xs text-[var(--muted)]">Last event</dt><dd className="mt-1">{project.last_event_at ? formatDate(project.last_event_at) : "Never"}</dd></div></dl><div className="mt-5 flex items-center gap-3 border-t pt-4"><a href={project.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm text-[var(--muted)]">{project.url}</a><Link href={{ pathname: "/analytics", query: { project: project.id } }} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-raised)]"><ChartNoAxesCombined className="h-3.5 w-3.5" />View analytics</Link></div></Card>)}</div> : <Card><EmptyState title="No projects yet" description="Create a project to receive a secure ingestion key and start monitoring." /></Card>}</>;
}
