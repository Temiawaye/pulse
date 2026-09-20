"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const isDark = resolvedTheme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Change color theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-9 shrink-0 place-items-center rounded-md border bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] disabled:cursor-wait disabled:opacity-60"
    >
      {mounted ? (
        isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />
      ) : (
        <span className="size-4" aria-hidden />
      )}
    </button>
  );
}
