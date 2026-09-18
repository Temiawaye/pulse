"use client";

import { useActionState, useState } from "react";
import { Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { deleteProject } from "@/app/(dashboard)/projects/actions";
import { Button } from "@/components/ui/button";

export function DeleteProject({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteProject, {});

  return <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Delete ${name}`}
      className="rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
    >
      <Trash2 className="h-4 w-4" />
    </button>
    <AnimatePresence>{open && !state.success ? <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && !pending && setOpen(false)}
      onKeyDown={(event) => event.key === "Escape" && !pending && setOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        role="dialog" aria-modal="true" aria-labelledby={`delete-project-${id}`}
        className="w-full max-w-md rounded-lg border bg-[var(--surface)] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`delete-project-${id}`} className="text-lg font-semibold">Delete project?</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              <strong className="font-medium text-[var(--foreground)]">{name}</strong> and all of its monitoring data will be permanently deleted.
            </p>
          </div>
          <button type="button" disabled={pending} onClick={() => setOpen(false)} aria-label="Close" className="disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form action={action} className="mt-6">
          <input type="hidden" name="projectId" value={id} />
          {state.error ? <p role="alert" className="mb-4 text-sm text-[var(--danger)]">{state.error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" disabled={pending} onClick={() => setOpen(false)} className="border bg-transparent text-[var(--foreground)]">Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-[var(--danger)] text-white">
              <Trash2 className="h-4 w-4" />{pending ? "Deleting..." : "Delete project"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div> : null}</AnimatePresence>
  </>;
}
