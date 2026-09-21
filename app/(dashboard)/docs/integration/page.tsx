import { IntegrationGuide } from "@/components/docs/integration-guide";
import { getProjects } from "@/lib/projects";

export default async function IntegrationPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const filters = await searchParams;
  const projects = await getProjects();
  const selected = projects.find((project) => project.id === filters.project) ?? projects[0] ?? null;
  const pulseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return <IntegrationGuide projects={projects} selected={selected} pulseUrl={pulseUrl} />;
}
