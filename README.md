# Pulse

Pulse is a real-time application monitoring and analytics dashboard built with Next.js and Supabase. It accepts authenticated request events from external applications, stores them in PostgreSQL, and turns them into live monitoring views, historical analytics, and searchable logs.

## Overview

Pulse is designed for developers who want a lightweight monitoring dashboard for server-side applications, APIs, backend middleware, and CI-integrated services.

The main workflow is:

```text
Monitored Application
      |
      | POST /api/events + Bearer ingestion key
      v
Pulse Ingestion API
      |
      +--> validate event
      +--> verify project key
      +--> enforce rate limit
      v
Supabase PostgreSQL
      |
      +--> Live dashboard
      +--> Historical analytics
      +--> Searchable logs
```

A user signs in, creates a project, copies its one-time ingestion key, and sends monitoring events to Pulse. The dashboard then exposes request activity and aggregated performance information for that project.

## Features

- Email/password authentication with Supabase Auth
- Project creation and project-scoped ingestion keys
- SHA-256 hashing for stored ingestion keys
- Authenticated `POST /api/events` ingestion endpoint
- PostgreSQL-backed monitoring event persistence
- Supabase Realtime-powered live dashboard updates
- Historical analytics with configurable time windows
- Request volume, latency, error-rate, server-error-rate, and request-rate metrics
- Recharts-powered monitoring visualizations
- Searchable and filterable request logs
- Project settings and management
- Light and dark themes
- Database-backed ingestion rate limiting
- Row Level Security for user and project isolation
- Demo event seeding utility

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

Pulse separates authenticated dashboard access from privileged event ingestion.

```text
Authenticated Browser
      |
      +--> Next.js dashboard
      |       |
      |       +--> Supabase session
      |       +--> RLS-protected queries
      |       +--> Realtime subscriptions
      |
External application / backend
      |
      | Bearer project ingestion key
      v
POST /api/events
      |
      +--> Zod validation
      +--> SHA-256 key lookup
      +--> PostgreSQL-backed rate limiting
      +--> privileged server Supabase client
      |
      v
monitoring_events
```

Browser access uses the authenticated Supabase session and RLS policies. Privileged database access is confined to the server-side ingestion path.

## Project Structure

```text
pulse/
├── app/
│   ├── (auth)/             # Login, registration, password recovery
│   ├── (dashboard)/        # Dashboard, analytics, logs, projects, settings
│   ├── api/events/         # Event ingestion API
│   └── auth/callback/      # Supabase authentication callback
├── components/
│   ├── analytics/
│   ├── charts/
│   ├── dashboard/
│   ├── docs/
│   ├── logs/
│   ├── projects/
│   └── settings/
├── lib/
│   ├── analytics/          # Metric aggregation helpers
│   ├── events/             # Event validation
│   └── supabase/           # Supabase server/admin/browser helpers
├── scripts/
│   └── seed-demo.mjs       # Demo monitoring-event generator
├── supabase/
│   ├── migrations/         # Database schema and SQL functions
│   └── tests/              # Database/RLS checks
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

Create a Supabase project and apply the SQL migrations in `supabase/migrations` in filename order using the Supabase SQL editor or CLI.

### 4. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Recommended Supabase key format:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The codebase also supports the legacy Supabase JWT-key format:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never expose `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` through a `NEXT_PUBLIC_` variable.

### 5. Configure Supabase Auth

Add the following local redirect URL to the allowed Supabase Auth redirect URLs:

```text
http://localhost:3000/auth/callback
```

### 6. Start the development server

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
| `NEXT_PUBLIC_SITE_URL` | Application origin used by Pulse |

Use one supported Supabase credential format rather than configuring both unless you intentionally need compatibility.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run seed:demo
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm test` | Run the Vitest suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run seed:demo` | Generate demo monitoring events |

## Usage

1. Register or sign in.
2. Create a project.
3. Copy the raw ingestion key when it is shown.
4. Store that key securely in the monitored application's server-side environment.
5. Send request events to `POST /api/events`.
6. Use Dashboard for live activity, Analytics for historical trends, and Logs for request-level inspection.

### Send an event

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $PULSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/api/health","statusCode":200,"responseTime":42}'
```

A successful request returns HTTP `202 Accepted` with an event identifier:

```json
{
  "accepted": true,
  "eventId": "generated-event-id"
}
```

Supported optional fields include `projectId`, `timestamp`, `environment`, `userAgent`, `region`, and non-sensitive `metadata`.

The ingestion route validates event shape, limits the request body to 16 KB, rejects invalid project/environment combinations, and rate-limits ingestion by project key.

### Seed demo data

```bash
PULSE_URL=http://localhost:3000 PULSE_API_KEY=your_ingestion_key npm run seed:demo
```

The included seed script submits 40 demo events to the configured Pulse instance.

## API

### `POST /api/events`

Accepts a monitoring event for the project identified by the bearer ingestion key.

**Required headers**

```http
Authorization: Bearer <project-ingestion-key>
Content-Type: application/json
```

**Required event fields**

| Field | Description |
| --- | --- |
| `method` | HTTP method being recorded |
| `path` | Monitored request path |
| `statusCode` | HTTP response status code |
| `responseTime` | Request duration in milliseconds |

The route can return `400`, `401`, `403`, `413`, `422`, `429`, `500`, or `503` when validation, authorization, storage, or rate-limit checks fail.

## Security

- Project ingestion keys are stored as SHA-256 hashes.
- Browser users access data through authenticated, RLS-scoped Supabase sessions.
- Privileged Supabase credentials are used only on the server.
- Direct browser insertion of monitoring events is restricted by the database security model.
- Ingestion rate limiting is persisted in PostgreSQL.
- Monitoring keys should only be used from trusted server-side code, backend middleware, or CI.

Do not embed project ingestion keys in public browser bundles.

## Deployment

The application follows the standard Next.js deployment model and is suitable for Vercel or another Node.js-compatible platform.

Before deploying:

1. Apply all Supabase migrations.
2. Configure production environment variables.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Add the production `/auth/callback` URL to Supabase Auth redirect URLs.
5. Run `npm run build`.

## Screenshots

> Screenshots can be added here to showcase the live dashboard, analytics charts, project management, and logs.

## Contributing

1. Fork or branch from the repository.
2. Create a focused feature branch.
3. Make your changes.
4. Run the relevant quality checks.
5. Commit with a descriptive message.
6. Push the branch and open a pull request.

## License

No project license file is currently present in the repository.

## Author

Maintained by [Temiawaye](https://github.com/Temiawaye).
