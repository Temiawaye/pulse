"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/lib/types";
import { TIME_RANGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

function useUrlValue() {
  const router = useRouter(); 
  const pathname = usePathname(); 
  const params = useSearchParams();

  return (key: string, value: string) => {
    const next = new URLSearchParams(params);
    
    if (value) next.set(key, value); else next.delete(key);

    if (key !== "page") next.delete("page");

    router.replace(`${pathname}?${next.toString()}`);
  };
}

export function ProjectSelector({ projects, value }: { projects: Project[]; value?: string }) {
  const setValue = useUrlValue();

  return (
    <Select
      ariaLabel="Project"
      value={value ?? ""}
      onValueChange={(next) => setValue("project", next)}
      className="min-w-40"
      options={[{ value: "", label: "All projects" }, ...projects.map((project) => ({ value: project.id, label: project.name }))]}
    />
  );
}

export function TimeRangeSelector({ value = "24h" }: { value?: string }) {
  const setValue = useUrlValue();
  return (
    <div className="flex h-9 rounded-md border bg-[var(--surface)] p-0.5" aria-label="Time range">
      {TIME_RANGES.map((range) => (
        <button 
          key={range.value} 
          onClick={() => setValue("range", range.value)} 
          aria-pressed={value === range.value} 
          className={cn(
            "min-w-10 rounded px-2 text-xs font-medium text-[var(--muted)]", 
            value === range.value && "bg-[var(--surface-raised)] text-[var(--foreground)]")}>
            {range.label}
        </button>
      ))}
    </div>
  );
}
