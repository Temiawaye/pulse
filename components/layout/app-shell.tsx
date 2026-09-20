"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {

  const [open, setOpen] = useState(false);

  return (
    
    <div className="min-h-screen bg-[var(--background)]">
      
      <Sidebar 
        open={open} 
        onClose={() => setOpen(false)} 
      />
      
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-4 backdrop-blur md:px-7">
        <button 
          className="rounded-md p-2 lg:hidden" 
          onClick={() => setOpen(true)} 
          aria-label="Open navigation">
            <Menu className="h-5 w-5" />
        </button>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          <span className="max-w-36 truncate text-sm text-[var(--muted)] sm:max-w-52">
            {userEmail}
          </span>
          <ThemeToggle />
        </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] p-4 md:p-7">
          {children}
        </main>
    </div>
    
  </div>
  );
}
