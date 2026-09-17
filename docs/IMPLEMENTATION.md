# Pulse implementation checklist

- [x] Foundation: Next.js 16, TypeScript, Tailwind, responsive shell, typography and tokens
- [x] Authentication: registration, login, logout, recovery callback, password reset and protected routes
- [x] Projects: creation, one-time API key reveal, hashed key storage and integration sample
- [x] Ingestion: validated bounded payloads, bearer authentication, persisted events and database-backed rate limit
- [x] Dashboard: server aggregates, live chart, time ranges, project selection and truthful uptime state
- [x] Analytics: volume, latency, outcomes, errors, slow endpoints and URL filters
- [x] Logs: server search/filter/pagination and keyboard-accessible detail drawer
- [x] Realtime: authorized scoped subscription, deduplication, cleanup and reconnect reconciliation
- [x] Settings: profile, theme and persisted monitoring defaults; optional features identified as unavailable
- [x] Deployment: migrations, environment template, demo seed and Vercel setup documentation

## Assumptions and omissions

- Uptime is only calculated from `uptime_checks`; Pulse does not schedule checks in this MVP.
- Notifications, webhooks, custom retention, exports, public status pages and teams remain post-MVP.
- The PostgreSQL minute-bucket limiter is deliberately simple and distributed-safe. Its default is 120 events per key per minute.
- Supabase credentials are required for integrated authentication, persistence and realtime verification.
