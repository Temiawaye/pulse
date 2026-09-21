"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "code";
};

export function Select({
  options,
  name,
  value,
  defaultValue = "",
  onValueChange,
  ariaLabel,
  disabled,
  className,
  variant = "default",
}: SelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedValue = value ?? internalValue;
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === selectedValue));
  const selected = options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function choose(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  function move(direction: 1 | -1) {
    let next = activeIndex;
    do next = (next + direction + options.length) % options.length;
    while (options[next]?.disabled && next !== activeIndex);
    setActiveIndex(next);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={selectedValue} disabled={disabled} /> : null}
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        disabled={disabled}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) { setActiveIndex(selectedIndex); setOpen(true); }
            else move(event.key === "ArrowDown" ? 1 : -1);
          }
          if (event.key === "Home" && open) { event.preventDefault(); setActiveIndex(0); }
          if (event.key === "End" && open) { event.preventDefault(); setActiveIndex(options.length - 1); }
          if ((event.key === "Enter" || event.key === " ") && open) {
            event.preventDefault();
            const option = options[activeIndex];
            if (option && !option.disabled) choose(option.value);
          }
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-left text-sm text-[var(--foreground)] transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_28%,var(--border))] disabled:cursor-not-allowed disabled:opacity-50",
          variant === "code" && "h-auto border-transparent bg-transparent px-2 py-2 text-xs text-[#d8dee2] hover:border-transparent hover:bg-white/5",
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180", variant === "code" && "h-3.5 w-3.5 text-[#aab2b7]")} />
      </button>

      {open ? (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${id}-option-${activeIndex}`}
          className={cn(
            "absolute left-0 z-50 mt-2 max-h-72 min-w-full overflow-y-auto rounded-xl border bg-[var(--surface)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
            variant === "code" && "left-auto right-0 min-w-36 border-white/10 bg-[#111416] shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
          )}
        >
          {options.map((option, index) => (
            <button
              id={`${id}-option-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option.value)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-raised)] disabled:cursor-not-allowed disabled:opacity-45",
                activeIndex === index && "bg-[var(--surface-raised)]",
                variant === "code" && "text-[#e7ecef] hover:bg-white/10",
                variant === "code" && activeIndex === index && "bg-white/10",
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === selectedValue ? <Check className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
