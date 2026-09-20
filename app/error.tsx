"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Unable to load Pulse</h1>
        <p className="my-2 text-sm text-[var(--muted)]">The request failed. Your data has not been changed.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
