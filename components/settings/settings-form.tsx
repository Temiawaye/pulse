"use client";
import { useActionState, useEffect } from "react";
import { useTheme } from "next-themes";
import { saveSettings } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface Profile { 
    full_name: string; 
    avatar_url: string | null; 
    theme: string; 
    default_range: string; 
    slow_request_threshold: number 
}

export function SettingsForm({ profile, email }: { profile: Profile; email: string }) { 
    const [state, action, pending] = useActionState(saveSettings, {}); 
    const { setTheme } = useTheme(); 
    
    useEffect(() => {
        if (state.success) {
            const form = document.querySelector<HTMLFormElement>("#settings-form");
            const theme = new FormData(form!).get("theme") as string;
            setTheme(theme);
        } 
    }, [setTheme, state.success]); 
    
    return (
        <form 
            id="settings-form" 
            action={action} 
            className="divide-y"
        >
        
        <Section 
            title="Profile" 
            description="Your identity inside Pulse.">
            <Field 
                name="full_name" 
                label="Full name" 
                defaultValue={profile.full_name} 
            />
            
            <Field 
                name="email" 
                label="Email" 
                type="email" 
                defaultValue={email} 
                disabled 
            />

            <Field 
                name="avatar_url" 
                label="Avatar URL" 
                type="url" 
                defaultValue={profile.avatar_url ?? ""} 
                placeholder="https://example.com/avatar.jpg" 
            />
        </Section>
        
        <Section 
            title="Appearance" 
            description="Applied to this browser after saving." 
        >
            <label className="block text-sm font-medium">
                Theme
                <Select
                    name="theme" 
                    defaultValue={profile.theme} 
                    ariaLabel="Theme"
                    className="mt-1.5"
                    options={[{ value: "system", label: "System" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
                />
            </label>
        </Section>
        
        <Section 
            title="Monitoring" 
            description="Defaults used across your analytics views."
        >
            <label 
                className="block text-sm font-medium"
            >
                Default analytics period
                <Select
                    name="default_range" 
                    defaultValue={profile.default_range} 
                    ariaLabel="Default analytics period"
                    className="mt-1.5"
                    options={[{ value: "1h", label: "1 hour" }, { value: "24h", label: "24 hours" }, { value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]}
                />
            </label>
            
            <Field 
                name="slow_request_threshold" 
                label="Slow request threshold (ms)" 
                type="number" 
                min={50} 
                max={60000} 
                defaultValue={profile.slow_request_threshold} 
            />
        </Section>
        
        <Section 
            title="Notifications & retention" 
            description="Email alerts, webhooks, scheduled uptime monitoring, and custom retention are not included in this MVP. No background notification behavior is active."
        >
            <p className="text-sm text-[var(--muted)]">
                Event retention follows your configured Supabase database policy.
            </p>
        </Section>
        
        <div className="flex items-center gap-3 p-5">
            <Button 
                disabled={pending}
            >
                {pending ? "Saving..." : "Save settings"}
            </Button>
            {state.error ? (
                <p 
                    role="alert" 
                    className="text-sm text-[var(--danger)]"
                >
                    {state.error}
                </p>
            ) : null}
            {state.success ? (
                <p 
                    role="status" 
                    className="text-sm text-[var(--accent-strong)]"
                >
                    {state.success}
                </p>
            ) : null}
        </div>
    </form>); 
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { 
    return (
        <section className="grid gap-5 p-5 md:grid-cols-[220px_1fr]">
            
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
            </div>
        
            <div className="max-w-lg space-y-4">{children}</div>
        
        </section>
    ); 
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { 
    return (
        <label 
            className="block text-sm font-medium"
        >
            {label}
            <input 
                {...props} 
                className="mt-1.5 h-10 w-full rounded-md border bg-[var(--background)] px-3 disabled:opacity-60" 
            />
        </label>
    ); 
}
