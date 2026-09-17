import Link from "next/link";
import { Activity } from "lucide-react";

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center"><Activity className="mb-4 h-7 w-7 text-[var(--muted)]" aria-hidden /><h2 className="font-semibold">{title}</h2><p className="mt-1 max-w-md text-sm text-[var(--muted)]">{description}</p>{href && action ? <Link className="mt-5 rounded-md bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-[var(--background)]" href={href}>{action}</Link> : null}</div>;
}
