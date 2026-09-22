"use client";
import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function AuthForm({ action, mode }: { action: (state: AuthState, data: FormData) => Promise<AuthState>; 
  mode: "login" | "register" | "forgot" | "reset" }) {
  const [state, formAction, pending] = useActionState(action, {});
  const content = { 
    login: ["Welcome back", "Sign in to monitor your applications"], 
    register: ["Create your account", "Start streaming application events"], 
    forgot: ["Reset your password", "We'll send a secure recovery link"], 
    reset: ["Choose a new password", "Use at least eight characters"] 
  }[mode];
    
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        <Link 
          href="/" 
          className="mb-10 block text-center font-semibold"
        >
          PULSE
        </Link>

        <div className="rounded-lg border bg-[var(--surface)] p-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{content[0]}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{content[1]}</p>
          
          <form 
            action={formAction}
            className="mt-6 space-y-4"
          >
            {
              mode === "register" ? 
                <Field 
                  label="Full name" 
                  name="name" 
                  autoComplete="name" 
                /> 
              : null
            }

            {
              mode !== "reset" ? 
                <Field 
                  label="Email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                /> 
              : null
            }
            
            {
              mode === "login" || mode === "register" || mode === "reset" ? 
                <Field 
                  label={mode === "reset" ? "New password" : "Password"}
                  name="password" 
                  type="password" 
                  autoComplete={mode === "login" ? "current-password" : "new-password"} 
                /> 
              : null
            }
            
            {
              state.error ? 
                <p role="alert" className="text-sm text-[var(--danger)]">
                  {state.error}
                </p> 
              : null
            }
            
            {
              state.success ? 
                <p role="status" className="text-sm text-[var(--accent-strong)]">{state.success}</p> 
              : null
            }
            
            <Button 
              disabled={pending} 
              className="w-full"
            >
              {
                pending ? 
                  "Please wait..." : 
                  mode === "login" ? 
                    "Sign in" : 
                    mode === "register" ? 
                      "Create account" : 
                      mode === "forgot" ? 
                        "Send recovery link" : 
                        "Update password"
              }
            </Button>
          </form>
          
          {
            mode === "login" ? 
              <div className="mt-5 flex justify-between text-sm">
                <Link href="/register">Create account</Link>
                <Link href="/forgot-password" className="text-[var(--muted)]">Forgot password?</Link>
              </div> 
            : mode === "register" ? 
              <p className="mt-5 text-sm">
                Already registered? <Link href="/login" className="font-medium">Sign in</Link>
              </p> 
            : null
          }
        </div>
      </div>
    </main>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { 
  return (
    <label className="block text-sm font-medium">
      {label}
      <input 
        required 
        {...props} 
        className="mt-1.5 h-10 w-full rounded-md border bg-[var(--background)] px-3 font-normal" 
      />
    </label>
  ); 
}
