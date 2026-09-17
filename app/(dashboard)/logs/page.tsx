import Link from "next/link";
import { LogFilterForm } from "@/components/logs/log-filters";
import { LogsTable } from "@/components/logs/logs-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getLogs, type LogFilters } from "@/lib/logs";
import { getProjects } from "@/lib/projects";

export default async function LogsPage({ searchParams }: { searchParams: Promise<LogFilters> }) { const filters = await searchParams; const [projects, data] = await Promise.all([getProjects(), getLogs(filters)]); return <><PageHeader title="Request logs" description="Search and inspect persisted monitoring events." /><LogFilterForm projects={projects} filters={filters} /><Card className="mt-5 overflow-hidden"><div className="border-b px-4 py-3 text-xs text-[var(--muted)]">{data.total} events</div><LogsTable events={data.events} /><div className="flex items-center justify-between border-t p-4 text-sm"><span className="text-[var(--muted)]">Page {data.page} of {data.pages}</span><div className="flex gap-2">{data.page > 1 ? <PageLink page={data.page - 1} filters={filters}>Previous</PageLink> : null}{data.page < data.pages ? <PageLink page={data.page + 1} filters={filters}>Next</PageLink> : null}</div></div></Card></>; }
function PageLink({ page, filters, children }: { page: number; filters: LogFilters; children: React.ReactNode }) { const params = new URLSearchParams(Object.entries({ ...filters, page: String(page) }).filter(([,v]) => v) as [string,string][]); return <Link className="rounded-md border px-3 py-1.5" href={`/logs?${params}`}>{children}</Link>; }
