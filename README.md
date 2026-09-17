# Pulse

Pulse is a real-time application monitoring dashboard built with Next.js 16, TypeScript, Supabase PostgreSQL/Auth/Realtime, Tailwind CSS, Recharts, Motion, and Lucide. It accepts authenticated server-side monitoring events and turns persisted data into live dashboards, historical analytics, and searchable logs.

## Local setup

1. Create a Supabase project and run the files in `supabase/migrations` in filename order using the SQL editor or Supabase CLI.
2. Copy `.env.example` to `.env.local` and provide either the current Supabase URL/publishable/secret keys or the legacy URL/anon/service-role keys, plus the site URL. Pulse exposes only the URL and publishable key to the client; never prefix a secret key with `NEXT_PUBLIC_`.
3. In Supabase Auth URL configuration, add `http://localhost:3000/auth/callback` as a redirect URL.
4. Run `npm install` and `npm run dev`, then open `http://localhost:3000`.

Register, confirm the account if email confirmation is enabled, then create a project. The raw ingestion key is displayed once; Pulse stores only its SHA-256 hash.

## Send an event

Send events from trusted server code, CI, or backend middleware. Never embed the ingestion key in a public browser bundle.

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $PULSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/api/health","statusCode":200,"responseTime":42}'
```

Optional fields are `projectId`, `timestamp`, `environment`, `userAgent`, `region`, and non-sensitive `metadata`. Payloads are capped at 16 KiB. Timestamps may be at most 31 days old or five minutes in the future. Credential-like metadata keys and unknown fields are rejected.

Generate clearly marked demo events with `PULSE_URL=http://localhost:3000 PULSE_API_KEY=pulse_live_xxx npm run seed:demo`.

## Metric definitions

- **Total requests:** persisted matching events in the selected UTC time window.
- **Average latency:** mean `response_time` in milliseconds; zero for an empty dataset.
- **Error rate:** events with status `>= 400` divided by total matching events.
- **Server error rate:** events with status `>= 500` divided by total matching events.
- **Requests per minute:** total matching events divided by the selected window length (60, 1,440, 10,080, or 43,200 minutes).
- **Buckets:** 5 minutes for 1H, 1 hour for 24H, 6 hours for 7D, and 1 day for 30D.
- **Uptime:** successful rows in `uptime_checks` divided by all matching checks. It reads **Not configured** when no real checks exist.

All timestamps are stored as PostgreSQL `timestamptz` and rendered in the viewer's locale. Historical aggregates run in PostgreSQL; the browser receives aggregates and a bounded recent-event buffer.

## Security and realtime

RLS limits profiles, projects, events, and uptime checks to their owner. Authenticated users cannot insert monitoring events directly; the service-role client is isolated to `/api/events`, where a hashed API key determines the project. Realtime uses the authenticated browser session and table RLS, scopes by project where selected, deduplicates event IDs, disposes old channels, and refreshes after reconnects and every minute.

The ingestion limiter is persisted in PostgreSQL rather than process memory, so it works across Vercel instances. For higher traffic, place a managed edge limiter in front of the route.

Run the transactional two-user isolation check against a disposable or local Supabase database:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The automated suite covers empty and non-empty metrics, time-window boundaries, malformed payloads and keys, and realtime deduplication. The SQL test verifies project and event isolation between two users.

## Deploy to Vercel

Import the GitHub repository into Vercel, add the four variables from `.env.example`, and set `NEXT_PUBLIC_SITE_URL` to the production origin. Add `https://your-domain/auth/callback` to Supabase Auth redirect URLs and deploy. Apply migrations before accepting traffic. Vercel and Supabase plan quotas change, so review their current official limits before relying on a free tier.

See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) for scope decisions and optional omissions.
