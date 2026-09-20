# Pulse

Pulse is a real-time application monitoring and analytics dashboard built with Next.js and Supabase. Applications send authenticated request events to Pulse, which persists them in PostgreSQL and turns them into live monitoring views, historical analytics, and searchable logs.

## Overview

Pulse is designed for developers who want a lightweight monitoring dashboard they can integrate into their own server-side applications.

The primary workflow is:

```text
Monitored Application
      |
      | POST /api/events + Bearer ingestion key
      v
Pulse Ingestion API
      |
      v
Supabase PostgreSQL
      |
      +--> Realtime dashboard
      +--> Historical analytics
      +--> Searchable logs
```

Users register, create a project, copy the one-time ingestion key, and send server-side monitoring events to Pulse. The dashboard then displays live activity and aggregated performance metrics for that project.

## Features

- Email/password authentication with Supabase Auth
- Project creation and per-project ingestion keys
- SHA-256 hashing of stored ingestion keys
- Authenticated `POST /api/events` ingestion endpoint
- PostgreSQL-backed event persistence
- Real-time dashboard updates through Supabase Realtime
- Historical analytics with configurable time windows
- Request volume, latency, error-rate, server-error-rate, and request-rate metrics
- Recharts-powered monitoring visualizations
- Searchable/filterable request logs
- Project settings and management
- Light/dark theme support
- Database-backed ingestion rate limiting
- Row Level Security for user and project isolation
- Demo event seeding script

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Realtime | Supabase Realtime |
| Validation | Zod |
| Charts | Recharts |
| Animation | Motion |
| Theme | next-themes |
| Testing | Vitest |
| Icons | Lucide React |

## Architecture

Pulse separates browser-safe Supabase access from privileged server-side ingestion.

```text
Authenticated Browser
      |
      +--> Next.js dashboard pages
      |       |
      |       +--> Supabase session / RLS
      |       +--> Realtime subscriptions
      |
External server / CI / backend middleware
      |
      | Bearer project ingestion key
      v
POST /api/events
      |
      +--> validate payload
      +--> hash/verify API key
      +--> rate-limit
      +--> privileged server Supabase client
      |
      v
PostgreSQL events
```

Historical metric aggregation is performed in PostgreSQL, while the browser receives aggregate data plus a bounded recent-event buffer.

## Project Structure

```text
pulse/
├── app/
│   ├── (auth)/             # Login, registration, password recovery
│   ├── (dashboard)/        # Dashboard, analytics, logs, projects, settings
│   ├── api/events/         # Monitoring event ingestion API
│   └── auth/callback/      # Supabase auth callback
├── components/
│   ├── analytics/
│   ├── charts/
│   ├── dashboard/
│   ├── logs/
│   ├── projects/
│   └── settings/
├── lib/
│   ├── analytics/          # Metrics and aggregation helpers
│   ├── events/             # Event validation
│   └── supabase/           # Browser/server/admin Supabase clients
├── scripts/
│   └── seed-demo.mjs       # Demo event generator
├── supabase/
│   ├── migrations/         # Database schema, rate limiting, analytics functions
│   └── tests/              # RLS isolation checks
├── docs/
│   └── IMPLEMENTATION.md
├── .env.example
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/Temiawaye/pulse.git
cd pulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Prepare Supabase

Create a Supabase project and apply the files in `supabase/migrations` in filename order using the Supabase SQL editor or CLI.

### 4. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Pulse supports the current Supabase key format and a legacy JWT-key fallback.

Recommended format:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Legacy format:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose a secret or service-role key through a `NEXT_PUBLIC_` variable.

### 5. Configure Supabase Auth

Add this local callback URL to Supabase Auth redirect URLs:

```text
http://localhost:3000/auth/callback
```

### 6. Start the application

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Current-format Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Current-format browser-safe Supabase key |
| `SUPABASE_SECRET_KEY` | Current-format server-only privileged key |
| `NEXT_PUBLIC_SUPABASE_URL` | Legacy/browser Supabase URL fallback |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy server-only service-role key |
| `NEXT_PUBLIC_SITE_URL` | Pulse application origin |

Use one supported Supabase credential format rather than exposing duplicate secrets unnecessarily.

## Available Scripts

```bash
npm run dev            # Start Next.js development mode
npm run build          # Build for production
npm run start          # Start the production server
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript checks
npm test               # Run the Vitest suite
npm run test:coverage  # Run tests with coverage
npm run seed:demo      # Send demo events to a Pulse project
```

## Usage

1. Register or sign in.
2. Create a project.
3. Copy the raw ingestion key when it is displayed. Pulse stores only its hash.
4. Send request events from trusted server code.
5. Open the dashboard to watch live events.
6. Use Analytics for historical trends and Logs for request-level inspection.

### Send an event

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $PULSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/api/health","statusCode":200,"responseTime":42}'
```

Supported optional fields include `projectId`, `timestamp`, `environment`, `userAgent`, `region`, and non-sensitive `metadata`.

The ingestion route rejects unknown fields, credential-like metadata keys, invalid timestamps, oversized payloads, and invalid API keys.

### Seed demo data

```bash
PULSE_URL=http://localhost:3000 PULSE_API_KEY=your_ingestion_key npm run seed:demo
```

## Metric Definitions

- **Total requests:** matching persisted events in the selected UTC window
- **Average latency:** mean response time in milliseconds
- **Error rate:** requests with status `>= 400` divided by total requests
- **Server error rate:** requests with status `>= 500` divided by total requests
- **Requests per minute:** matching requests divided by selected window length
- **Uptime:** successful rows in `uptime_checks` divided by matching checks; shown as not configured when no real checks exist

All event timestamps are stored as PostgreSQL `timestamptz` values.

## Security

- RLS isolates profiles, projects, events, and uptime checks by owner.
- Authenticated browser users cannot insert monitoring events directly.
- The service-role/secret client is confined to the server-side ingestion path.
- Ingestion keys are stored as SHA-256 hashes.
- Realtime subscriptions use the authenticated user's RLS-scoped session.
- Rate limiting is persisted in PostgreSQL rather than process memory.

Monitoring keys should be used only from trusted server-side code, CI, or backend middleware. Do not ship them in a public browser bundle.

## Deployment

The repository is configured for a standard Next.js deployment and can be deployed to Vercel.

Before production deployment:

1. Apply all Supabase migrations.
2. Configure production environment variables.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Add `https://your-domain/auth/callback` to Supabase Auth redirect URLs.
5. Run `npm run build` and the verification scripts.

## Screenshots

> Screenshots can be added here to showcase the live dashboard, analytics charts, project management, and logs.

## Contributing

1. Create a focused feature branch.
2. Make the change.
3. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` as appropriate.
4. Commit with a descriptive message.
5. Push the branch and open a pull request.

## License

No license file is currently present in the repository.

## Author

Maintained by [Temiawaye](https://github.com/Temiawaye).

For implementation scope and project decisions, see `docs/IMPLEMENTATION.md`.
