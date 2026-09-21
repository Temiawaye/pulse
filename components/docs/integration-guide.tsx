"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDot,
  Clipboard,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  Gauge,
  Info,
  Lightbulb,
  RefreshCw,
  Server,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/select";

const nav = [
  ["getting-started", "Getting started"],
  ["connect", "Connect your project"],
  ["install", "Install integration"],
  ["frameworks", "Framework guides"],
  ["events", "Sending events"],
  ["custom-events", "Custom events"],
  ["verify", "Verify connection"],
  ["troubleshooting", "Troubleshooting"],
] as const;

export function IntegrationGuide({
  projects,
  selected,
  pulseUrl,
}: {
  projects: Project[];
  selected: Project | null;
  pulseUrl: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(nav[0][0]);
  const [checking, setChecking] = useState(false);
  const projectId = selected?.public_id ?? "prj_YOUR_PROJECT_ID";
  const environment = selected?.environment ?? "production";
  const endpoint = `${pulseUrl}/api/events`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id as typeof active);
      },
      { rootMargin: "-15% 0px -70%", threshold: [0, 0.25, 0.6] },
    );
    nav.forEach(([id]) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  const curl = `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer $PULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"projectId":"${projectId}","method":"GET","path":"/pricing","statusCode":200,"responseTime":42,"environment":"${environment}"}'`;

  const nextTypeScript = `// Runs only on your server
export async function GET() {
  const started = performance.now()
  const response = Response.json({ ok: true })

  await fetch("${endpoint}", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.PULSE_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: "${projectId}",
      method: "GET",
      path: "/api/example",
      statusCode: response.status,
      responseTime: Math.round(performance.now() - started),
      environment: "${environment}",
    }),
  })

  return response
}`;

  const nextJavaScript = nextTypeScript;

  const reactTypeScript = `// Call from your React app's backend
type RequestEvent = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  statusCode: number
  responseTime: number
}

export async function reportRequest(event: RequestEvent) {
  return fetch("${endpoint}", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.PULSE_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId: "${projectId}", ...event }),
  })
}`;

  const reactJavaScript = `// Call from your React app's backend
export async function reportRequest(event) {
  return fetch("${endpoint}", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.PULSE_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId: "${projectId}", ...event }),
  })
}`;

  async function verify() {
    setChecking(true);
    router.refresh();
    window.setTimeout(() => setChecking(false), 700);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="border-b pb-8" id="getting-started">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent-strong)]">
          <Code2 className="h-4 w-4" /> Integration guide
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Connect Your Website</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Send lightweight request-performance events from your website&apos;s trusted server to Pulse. Pulse validates and stores each event, then turns it into live monitoring, logs, and analytics.
        </p>
        <Callout kind="warning" title="Keep your ingestion key on the server">
          Pulse does not provide a public browser tracking script. Never put the ingestion key in HTML, React client code, or a <code>NEXT_PUBLIC_</code> variable.
        </Callout>
        <div className="mt-7 grid items-center gap-2 rounded-xl border bg-[var(--surface)] p-4 text-center text-sm font-medium sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <FlowItem icon={ExternalLink} label="Your website server" />
          <ArrowRight className="mx-auto hidden h-4 w-4 text-[var(--muted)] sm:block" />
          <FlowItem icon={Code2} label="Monitoring code" />
          <ArrowRight className="mx-auto hidden h-4 w-4 text-[var(--muted)] sm:block" />
          <FlowItem icon={Server} label="Pulse API" />
          <ArrowRight className="mx-auto hidden h-4 w-4 text-[var(--muted)] sm:block" />
          <FlowItem icon={Gauge} label="Dashboard" />
        </div>
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,820px)]">
        <aside className="hidden lg:block">
          <nav aria-label="Documentation sections" className="sticky top-24 space-y-1 border-l pl-3">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={cn("block rounded-r-md px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]", active === id && "-ml-[13px] border-l-2 border-[var(--accent)] bg-[var(--surface-raised)] pl-[22px] font-medium text-[var(--foreground)]")}>
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 space-y-16">
          <Section id="connect" eyebrow="Before you start" title="Choose the project that will receive events">
            <p>You need a Pulse project, its public project ID, the one-time ingestion API key, and access to your website&apos;s server code.</p>
            {projects.length ? (
              <div className="mt-6 rounded-lg border bg-[var(--surface)] p-5">
                <label className="block text-sm font-medium" htmlFor="project">Project used in these examples</label>
                <Select
                  ariaLabel="Project used in these examples"
                  value={selected?.id}
                  onValueChange={(project) => router.push(`/docs/integration?project=${project}`)}
                  className="mt-2"
                  options={projects.map((project) => ({ value: project.id, label: `${project.name} · ${project.environment}` }))}
                />
                <dl className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
                  <Detail label="Project name" value={selected!.name} />
                  <Detail label="Project URL" value={selected!.url} />
                  <Detail label="Project ID" value={selected!.public_id} mono copy />
                </dl>
              </div>
            ) : (
              <Callout kind="note" title="Create a project first">
                Go to <Link href="/projects" className="font-medium underline">Projects</Link>, choose a name, URL, and environment, then save the API key when Pulse shows it. The key cannot be recovered later.
              </Callout>
            )}
          </Section>

          <Section id="install" eyebrow="Quick start" title="Send your first monitoring event">
            <Steps items={[
              <span key="1">Create or select a project in <Link href="/projects" className="underline">Projects</Link>. Its public ID is <code>{projectId}</code>.</span>,
              <span key="2">Store the one-time <code>pulse_live_…</code> key as a server-only <code>PULSE_API_KEY</code> environment variable.</span>,
              <span key="3">Measure a request on your server and POST its result to Pulse using the example below.</span>,
            ]} />
            <CodeBlock label="Terminal" code={curl} />
            <Callout kind="tip" title="A successful test returns HTTP 202">
              The response contains <code>{`{ "accepted": true, "eventId": "…" }`}</code>. Pulse accepts at most 120 events per key per minute.
            </Callout>
          </Section>

          <Section id="frameworks" eyebrow="Framework guides" title="Add Pulse to your stack">
            <div className="space-y-8">
              <Guide title="HTML / static sites">
                There is no safe tag to paste before <code>&lt;/head&gt;</code> or <code>&lt;/body&gt;</code>. Static browser code would expose your secret. Send events from the server, hosting function, or CI process behind the site; use the cURL example above to test it.
              </Guide>
              <Guide title="Next.js App Router">
                Add <code>PULSE_API_KEY</code> to your server environment (without <code>NEXT_PUBLIC_</code>) and report after your Route Handler produces a response.
                <CodeBlock variants={[
                  { language: "TypeScript", filename: "app/api/example/route.ts", code: nextTypeScript },
                  { language: "JavaScript", filename: "app/api/example/route.js", code: nextJavaScript },
                ]} />
              </Guide>
              <Guide title="React">
                React runs in the visitor&apos;s browser, so do not initialize Pulse in a component or <code>useEffect</code>. Put a small reporter in the Node/Express/serverless backend that serves your React application.
                <CodeBlock variants={[
                  { language: "TypeScript", filename: "server/monitor.ts", code: reactTypeScript },
                  { language: "JavaScript", filename: "server/monitor.js", code: reactJavaScript },
                ]} />
              </Guide>
            </div>
          </Section>

          <Section id="events" eyebrow="Sending events" title="How analytics data reaches Pulse">
            <ol className="space-y-3 text-sm leading-6">
              {[
                "A visitor or client makes a request to your website.",
                "Your server handles the request and measures its duration.",
                "Trusted server code creates a monitoring event.",
                "The Pulse API authenticates the key, validates the payload, and applies the rate limit.",
                "The event is stored in PostgreSQL and published through Supabase Realtime.",
                "The dashboard reads the stored data and updates metrics, charts, and logs.",
              ].map((item, index) => <li className="flex gap-3" key={item}><span className="font-mono text-[var(--accent-strong)]">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}
            </ol>
            <div className="mt-7 flex flex-col items-center gap-2 rounded-xl border bg-[var(--surface)] p-5 text-sm font-medium">
              {[[ExternalLink, "Visitor"], [Server, "External website server"], [Code2, "Monitoring code"], [CircleDot, "Pulse /api/events"], [Database, "PostgreSQL"], [Gauge, "Analytics dashboard"]].map(([Icon, label], index, rows) => <div className="contents" key={String(label)}><div className="flex w-full max-w-sm items-center gap-3 rounded-md bg-[var(--surface-raised)] px-4 py-2.5"><Icon className="h-4 w-4 text-[var(--accent-strong)]" />{label as string}</div>{index < rows.length - 1 ? <ArrowDown className="h-4 w-4 text-[var(--muted)]" /> : null}</div>)}
            </div>
            <h3 className="mt-10 text-lg font-semibold">Event payload</h3>
            <p className="mt-2">Required fields describe the completed HTTP request. Optional fields add context; unknown fields are rejected.</p>
            <CodeBlock label="JSON" code={`{
  "projectId": "${projectId}",
  "method": "GET",
  "path": "/pricing",
  "statusCode": 200,
  "responseTime": 42,
  "timestamp": "2026-09-21T10:30:00.000Z",
  "userAgent": "Mozilla/5.0 …",
  "region": "ng-lagos",
  "metadata": { "cache": "hit" },
  "environment": "${environment}"
}`} />
            <p className="mt-4 text-sm text-[var(--muted)]"><strong className="text-[var(--foreground)]">Required:</strong> method, path (beginning with <code>/</code>), statusCode (100–599), and integer responseTime in milliseconds. <strong className="text-[var(--foreground)]">Optional:</strong> projectId, timestamp, userAgent, region, metadata, and environment. Payloads are limited to 16 KiB.</p>
          </Section>

          <Section id="custom-events" eyebrow="Custom events" title="Request monitoring only">
            <Callout kind="note" title="Custom product events are not supported yet">
              Pulse currently accepts HTTP request-performance events, not arbitrary events such as button clicks, sign-ups, purchases, downloads, or form submissions. Do not encode secrets or request bodies in metadata; credential-like metadata keys are rejected.
            </Callout>
          </Section>

          <Section id="verify" eyebrow="Verify connection" title="Confirm that Pulse received your event">
            <div className="rounded-lg border bg-[var(--surface)] p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div className="flex items-start gap-3">
                {selected?.last_event_at ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--accent)]" /> : <CircleDot className="mt-0.5 h-5 w-5 text-[var(--warning)]" />}
                <div><p className="font-medium">{selected?.last_event_at ? "Receiving events" : "Waiting for data"}</p><p className="mt-1 text-sm text-[var(--muted)]">{selected?.last_event_at ? `Last event ${formatDate(selected.last_event_at)}` : "Send the Quick Start request, then check again."}</p></div>
              </div>
              <button onClick={verify} disabled={checking || !selected} className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-[var(--surface-raised)] disabled:opacity-50 sm:mt-0">
                <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />{checking ? "Checking…" : "Verify connection"}
              </button>
            </div>
            <h3 className="mt-8 text-lg font-semibold">Real-time verification</h3>
            <Steps items={[
              <span key="1">Trigger a few requests on your connected website.</span>,
              <span key="2">Return to Pulse and choose the same project.</span>,
              <span key="3">Open <Link href="/dashboard" className="underline">Overview</Link> for live activity or <Link href="/logs" className="underline">Logs</Link> for the latest event details.</span>,
            ]} />
          </Section>

          <Section id="troubleshooting" eyebrow="Troubleshooting" title="Common integration problems">
            <div className="divide-y rounded-lg border bg-[var(--surface)]">
              <Trouble title="No events are appearing">Confirm the request returns 202, the API key is the one shown when this project was created, and the payload passes validation. Check server logs and the outgoing request—not the browser Network tab, because the integration must run server-side.</Trouble>
              <Trouble title="401 Invalid API key">The Authorization header must be exactly <code>Bearer pulse_live_…</code>. The key may be missing, truncated, or belong to a deleted project. Pulse stores only a hash; create a new project if the original key was lost.</Trouble>
              <Trouble title="403 Project ID does not match API key">The optional <code>projectId</code> belongs to a different project than the bearer key. Copy the selected project ID above, or omit projectId—Pulse identifies the project from the key.</Trouble>
              <Trouble title="422 Invalid event">Check the required fields and ranges. If supplied, environment must match the project. Timestamps may be no more than 31 days old or five minutes in the future. Sensitive metadata keys and unknown fields are rejected.</Trouble>
              <Trouble title="CORS or browser errors">Browser ingestion is intentionally unsupported and the API does not advertise cross-origin access. Move the request to your own backend; this also keeps the ingestion key private.</Trouble>
              <Trouble title="429 or 413 responses">429 means the project exceeded 120 events in a minute; retry after the response&apos;s <code>Retry-After</code> delay. 413 means the JSON payload is larger than 16 KiB.</Trouble>
              <Trouble title="Local development">Local servers can send events. Point them at <code>http://localhost:3000/api/events</code> when Pulse runs locally, use a development project, and set its environment field to <code>development</code>.</Trouble>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-24"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2><div className="mt-4 text-[15px] leading-7 text-[var(--muted)]">{children}</div></section>;
}

function FlowItem({ icon: Icon, label }: { icon: typeof Server; label: string }) {
  return <div className="flex items-center justify-center gap-2 rounded-md bg-[var(--surface-raised)] px-3 py-2.5"><Icon className="h-4 w-4 text-[var(--accent-strong)]" />{label}</div>;
}

function Callout({ kind, title, children }: { kind: "note" | "warning" | "tip"; title: string; children: React.ReactNode }) {
  const Icon = kind === "warning" ? AlertTriangle : kind === "tip" ? Lightbulb : Info;
  return <div className={cn("mt-5 flex gap-3 rounded-lg border-l-4 bg-[var(--surface)] p-4", kind === "warning" ? "border-l-[var(--warning)]" : "border-l-[var(--accent)]")}><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-strong)]" /><div><p className="font-medium text-[var(--foreground)]">{title}</p><div className="mt-1 text-sm leading-6 text-[var(--muted)]">{children}</div></div></div>;
}

type CodeVariant = { language: "TypeScript" | "JavaScript"; filename: string; code: string };

function CodeBlock({ label, code, variants }: { label?: string; code?: string; variants?: CodeVariant[] }) {
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState(0);
  const current = variants?.[selected];
  const displayedCode = current?.code ?? code ?? "";
  async function copy() { await navigator.clipboard.writeText(displayedCode); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-[#2a2e31] bg-[#090a0b] text-[#e7ecef] shadow-sm">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 px-4 text-xs text-[#aab2b7]">
        <span className="flex min-w-0 items-center gap-2 font-mono">
          <FileCode2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{current?.filename ?? label}</span>
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {variants ? (
            <Select
              ariaLabel="Code language"
              value={String(selected)}
              onValueChange={(next) => { setSelected(Number(next)); setCopied(false); }}
              variant="code"
              options={variants.map((variant, index) => ({ value: String(index), label: variant.language }))}
            />
          ) : null}
          <button onClick={copy} className="inline-flex items-center gap-1.5 rounded p-2 hover:bg-white/10" aria-label={`Copy ${current?.language ?? label} code`} title={copied ? "Copied" : "Copy code"}>
            {copied ? <Check className="h-4 w-4 text-[#62e6b1]" /> : <Clipboard className="h-4 w-4" />}
            <span className="sr-only">{copied ? "Copied" : "Copy code"}</span>
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-6"><code>{highlightCode(displayedCode)}</code></pre>
    </div>
  );
}

function highlightCode(code: string) {
  const tokenPattern = /(\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[A-Za-z_$][\w$]*\b|\b\d+\b|=>|===|!==|==|!=|\.\.\.|[{}()[\]:,.])/gm;
  const tokens = code.split(tokenPattern);
  const keywords = new Set(["export", "async", "function", "return", "const", "let", "var", "type", "interface", "string", "number", "boolean", "await", "new", "true", "false", "null", "undefined", "import", "from", "default"]);
  const globals = new Set(["Response", "JSON", "Math", "Date", "Promise", "process", "performance", "fetch", "console"]);

  return tokens.map((token, index) => {
    if (token.startsWith("//")) return <span className="text-[#7f898f]" key={index}>{token}</span>;
    if (/^["'`]/.test(token)) return <span className="text-[#65d88d]" key={index}>{token}</span>;
    if (keywords.has(token)) return <span className="text-[#f071a5]" key={index}>{token}</span>;
    if (globals.has(token)) return <span className="text-[#ffcb6b]" key={index}>{token}</span>;
    if (/^\d+$/.test(token)) return <span className="text-[#c792ea]" key={index}>{token}</span>;
    if (/^(=>|===|!==|==|!=|\.\.\.)$/.test(token)) return <span className="text-[#f071a5]" key={index}>{token}</span>;
    if (/^[A-Za-z_$]/.test(token)) {
      const next = tokens.slice(index + 1).find((part) => part.trim());
      const previous = [...tokens.slice(0, index)].reverse().find((part) => part.trim());
      if (next === ":") return <span className="text-[#c792ea]" key={index}>{token}</span>;
      if (next === "(" || previous === ".") return <span className="text-[#82d2ff]" key={index}>{token}</span>;
      return <span className="text-[#89b4fa]" key={index}>{token}</span>;
    }
    if (/^[{}()[\]:,.]$/.test(token)) return <span className="text-[#aeb8c0]" key={index}>{token}</span>;
    return token;
  });
}

function Steps({ items }: { items: React.ReactNode[] }) { return <ol className="mt-5 space-y-4">{items.map((item, index) => <li key={index} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">{index + 1}</span><span className="pt-0.5">{item}</span></li>)}</ol>; }
function Guide({ title, children }: { title: string; children: React.ReactNode }) { return <div><h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3><div className="mt-2">{children}</div></div>; }
function Detail({ label, value, mono, copy }: { label: string; value: string; mono?: boolean; copy?: boolean }) { return <div className="min-w-0"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className={cn("mt-1 truncate text-sm text-[var(--foreground)]", mono && "font-mono")}>{value}{copy ? <CopyInline value={value} /> : null}</dd></div>; }
function CopyInline({ value }: { value: string }) { const [copied, setCopied] = useState(false); return <button className="ml-2 align-middle" aria-label="Copy project ID" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }}>{copied ? <Check className="inline h-3.5 w-3.5 text-[var(--accent)]" /> : <Clipboard className="inline h-3.5 w-3.5" />}</button>; }
function Trouble({ title, children }: { title: string; children: React.ReactNode }) { return <details className="group p-5"><summary className="cursor-pointer list-none font-medium text-[var(--foreground)] marker:hidden">{title}<span className="float-right text-[var(--muted)] group-open:rotate-45">+</span></summary><div className="mt-3 text-sm leading-6">{children}</div></details>; }
