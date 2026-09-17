import { cn } from "@/lib/utils";

export function StatusBadge({ status, label }: { status: "good" | "warn" | "bad" | "neutral"; label: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", status === "good" && "text-[var(--accent-strong)]", status === "warn" && "text-[var(--warning)]", status === "bad" && "text-[var(--danger)]", status === "neutral" && "text-[var(--muted)]")}><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
