"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BookOpen, FolderKanban, LayoutDashboard, ScrollText, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { 
    href: "/dashboard", 
    label: "Overview", 
    icon: LayoutDashboard 
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: BarChart3 
  },
  { 
    href: "/logs", 
    label: "Logs", 
    icon: ScrollText 
  },
  { 
    href: "/projects", 
    label: "Projects", 
    icon: FolderKanban 
  },
  {
    href: "/docs/integration",
    label: "Integration guide",
    icon: BookOpen
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  
  const pathname = usePathname();

  return (
    <>
    {open ? 
      <button 
        aria-label="Close navigation" 
        className="fixed inset-0 z-30 bg-black/55 lg:hidden" 
        onClick={onClose} /> : null}
        
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-[var(--surface)] p-4 transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>

      <div className="flex h-12 items-center justify-between px-2">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 font-semibold">
          
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--accent)] text-white">
            <Activity className="h-4 w-4" />
          </span>PULSE
        </Link>
        
        <button 
          className="p-2 lg:hidden" 
          onClick={onClose} 
          aria-label="Close navigation">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav 
        aria-label="Primary" 
        className="mt-5 flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => <Link 
        key={href} 
        href={href} 
        onClick={onClose} 
        aria-current={pathname === href ? "page" : undefined} 
        className={cn(
          "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]", 
          pathname === href && "bg-[var(--surface-raised)] font-medium text-[var(--foreground)]")}> 
          
          <Icon className="h-4 w-4" aria-hidden />
          {label}
          </Link>)}
      </nav>
      
      <Link 
        href="/settings" 
        onClick={onClose} 
        className={cn(
          "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)]", 
          pathname === "/settings" && "bg-[var(--surface-raised)] text-[var(--foreground)]")}>

        <Settings className="h-4 w-4" />
        Settings

      </Link>
    </aside>
    </>
  );
}
