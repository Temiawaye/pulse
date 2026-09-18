"use server";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

export type ProjectState = { error?: string; projectId?: string; apiKey?: string };
export type DeleteProjectState = { error?: string; success?: boolean };
const schema = z.object({ name: z.string().trim().min(2).max(80), url: z.string().url().max(2048), environment: z.enum(["production", "staging", "development"]) });
const deleteSchema = z.object({ projectId: z.string().uuid() });

export async function createProject(_: ProjectState, formData: FormData): Promise<ProjectState> {
  const parsed = schema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { supabase, user } = await requireUser();
  const publicId = `prj_${randomBytes(6).toString("base64url")}`;
  const apiKey = `pulse_live_${randomBytes(24).toString("base64url")}`;
  const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");
  const { error } = await supabase.from("projects").insert({ ...parsed.data, user_id: user.id, public_id: publicId, api_key_hash: apiKeyHash, api_key_prefix: apiKey.slice(0, 17) });
  if (error) return { error: "Unable to create the project. Try a different name or URL." };
  revalidatePath("/projects"); return { projectId: publicId, apiKey };
}

export async function deleteProject(_: DeleteProjectState, formData: FormData): Promise<DeleteProjectState> {
  const parsed = deleteSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) return { error: "Invalid project." };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", parsed.data.projectId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "Unable to delete the project. Please try again." };
  if (!data) return { error: "Project not found or you do not have permission to delete it." };

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/logs");
  return { success: true };
}
