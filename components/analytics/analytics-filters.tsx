"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Project } from "@/lib/types";
import { ProjectSelector, TimeRangeSelector } from "@/components/filters";
import { Select } from "@/components/ui/select";

export function AnalyticsFilters({ projects, filters }: { projects: Project[]; filters: { project?: string; range?: string; status?: string; endpoint?: string } }) {
    
  const router = useRouter(); 
  const pathname = usePathname(); 
  const current = useSearchParams();
  
  const submit = (data: FormData) => { 
    const next = new URLSearchParams(current); 
    for (const [key, value] of data) { 
      if (value) next.set(key, String(value)); 
      else next.delete(key); 
    } 
    router.replace(`${pathname}?${next}`); 
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <ProjectSelector 
        projects={projects} 
        value={filters.project} 
      />
      <TimeRangeSelector 
        value={filters.range} 
      />
      
      <form action={submit} className="flex flex-wrap gap-2">
        <Select
          name="status" 
          defaultValue={filters.status ?? ""} 
          ariaLabel="HTTP status"
          options={[{ value: "", label: "All statuses" }, { value: "2xx", label: "2xx" }, { value: "3xx", label: "3xx" }, { value: "4xx", label: "4xx" }, { value: "5xx", label: "5xx" }]}
        />
        
        <label className="relative">
          <span className="sr-only">Endpoint filter</span>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted)]"/>
          <input 
            name="endpoint" 
            defaultValue={filters.endpoint} 
            placeholder="Filter endpoint" 
            className="h-9 w-44 rounded-md border bg-[var(--surface)] pl-8 pr-2 text-sm" 
          />
        </label>
        
        <button className="h-9 rounded-md border bg-[var(--surface)] px-3 text-sm">Apply</button>
      </form>
    </div>
  );
}
