"use client";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Project } from "@/lib/types";
import type { LogFilters } from "@/lib/logs";

export function LogFilterForm({ projects, filters }: { projects: Project[]; filters: LogFilters }) {
  const router = useRouter(); const pathname = usePathname();
  const submit = (form: FormData) => { const params = new URLSearchParams(); 
    
    for (const [key,value] of form) 
      if (value) params.set(key, String(value)); 
      
      router.replace(`${pathname}?${params}`); };
      
  return (
  <form 
    action={submit} 
    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_repeat(5,auto)_auto]"
  >
    
    <label className="relative">
      <span className="sr-only">Search endpoints</span>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted)]" />
      <input 
      name="query" 
      defaultValue={filters.query} 
      placeholder="Search endpoints" 
      className="h-9 w-full rounded-md border bg-[var(--surface)] pl-9 pr-3 text-sm" 
      />
    </label>
    
    <Select 
      name="method" 
      label="Method" 
      value={filters.method} 
      options={["GET","POST","PUT","PATCH","DELETE"]} 
    />
    
    <Select 
      name="status" 
      label="Status" 
      value={filters.status} 
      options={["2xx","3xx","4xx","5xx"]} 
    />
    
    <label className="sr-only">
      Project
      <select 
        name="project" 
        defaultValue={filters.project ?? ""} 
        className="not-sr-only h-9 rounded-md border bg-[var(--surface)] px-3 text-sm">
          
        <option value="">All projects</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </label>
    
    <label className="text-xs text-[var(--muted)]">
      From
      <input 
        name="from" 
        type="datetime-local" 
        defaultValue={filters.from} 
        className="block h-9 rounded-md border bg-[var(--surface)] px-2 text-sm text-[var(--foreground)]" />
    </label>
    
    <label className="text-xs text-[var(--muted)]">
      To
      <input 
        name="to" 
        type="datetime-local" 
        defaultValue={filters.to} 
        className="block h-9 rounded-md border bg-[var(--surface)] px-2 text-sm text-[var(--foreground)]" />
    </label>
    
    <button className="h-9 self-end rounded-md bg-[var(--foreground)] px-3 text-sm text-[var(--background)]">Apply</button>
    </form>
    )
}
function Select({ name, label, value, options }: { name: string; label: string; value?: string; options: string[] }) {
  return (
   <label className="sr-only">{label}
   <select 
      name={name} 
      defaultValue={value ?? ""} 
      className="not-sr-only h-9 rounded-md border bg-[var(--surface)] px-3 text-sm">
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((option) => <option key={option}>{option}</option>)}
   </select>
   </label>
  );
}
