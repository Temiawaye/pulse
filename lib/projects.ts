import "server-only";
import { requireUser } from "@/lib/auth";
import type { Project } from "@/lib/types";

export async function getProjects(): Promise<Project[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("projects").select("id,public_id,user_id,name,url,environment,created_at,monitoring_events(occurred_at)").order("created_at", { ascending: false }).limit(1, { referencedTable: "monitoring_events" });
  if (error) throw new Error("Unable to load projects.");
  return (data ?? []).map((row) => ({ ...row, last_event_at: Array.isArray(row.monitoring_events) ? row.monitoring_events[0]?.occurred_at : null })) as Project[];
}
