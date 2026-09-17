import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() { const { supabase, user } = await requireUser(); const { data } = await supabase.from("profiles").select("full_name,avatar_url,theme,default_range,slow_request_threshold").eq("id", user.id).single(); const profile = data ?? { full_name: user.user_metadata.full_name ?? "", avatar_url: null, theme: "system", default_range: "24h", slow_request_threshold: 500 }; return <><PageHeader title="Settings" description="Profile, appearance, and monitoring preferences." actions={<form action={logout}><button className="inline-flex h-9 items-center gap-2 rounded-md border bg-[var(--surface)] px-3 text-sm"><LogOut className="h-4 w-4" />Sign out</button></form>} /><Card><SettingsForm profile={profile} email={user.email ?? ""} /></Card></>; }
