"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string };
const credentials = z.object({ email: z.string().email(), password: z.string().min(8, "Use at least 8 characters") });

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient(); const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email or password is incorrect." };
  redirect("/dashboard");
}

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.extend({ name: z.string().trim().min(2).max(80) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient(); const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { data: { full_name: parsed.data.name }, emailRedirectTo: `${origin}/auth/callback` } });
  return error ? { error: error.message } : { success: "Check your email to confirm your account." };
}

export async function requestReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z.string().email().safeParse(formData.get("email")); if (!parsed.success) return { error: "Enter a valid email." };
  const supabase = await createClient(); const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${origin}/auth/callback?next=/reset-password` });
  return { success: "If that account exists, a recovery link is on its way." };
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z.string().min(8).safeParse(formData.get("password")); if (!parsed.success) return { error: "Use at least 8 characters." };
  const supabase = await createClient(); const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: error.message }; redirect("/dashboard");
}

export async function logout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login"); }
