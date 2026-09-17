create extension if not exists pgcrypto;

create type public.project_environment as enum ('production', 'staging', 'development');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', avatar_url text,
  default_range text not null default '24h' check (default_range in ('1h','24h','7d','30d')),
  slow_request_threshold integer not null default 500 check (slow_request_threshold between 50 and 60000),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(), public_id text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80), url text not null,
  environment public.project_environment not null, api_key_hash text unique not null,
  api_key_prefix text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.monitoring_events (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  method text not null check (method in ('GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS')),
  path text not null check (char_length(path) between 1 and 2048), status_code integer not null check (status_code between 100 and 599),
  response_time integer not null check (response_time between 0 and 3600000), user_agent text check (char_length(user_agent) <= 512),
  region text check (char_length(region) <= 100), metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(), created_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
);

create table public.uptime_checks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  is_up boolean not null, response_time integer check (response_time between 0 and 3600000), checked_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);
create index events_project_time_idx on public.monitoring_events(project_id, occurred_at desc);
create index events_status_idx on public.monitoring_events(project_id, status_code, occurred_at desc);
create index events_path_idx on public.monitoring_events(project_id, path text_pattern_ops);
create index uptime_project_time_idx on public.uptime_checks(project_id, checked_at desc);

alter table public.profiles enable row level security; alter table public.projects enable row level security;
alter table public.monitoring_events enable row level security; alter table public.uptime_checks enable row level security;
create policy "own profile" on public.profiles for all using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "own projects" on public.projects for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own events read only" on public.monitoring_events for select using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
create policy "own uptime read only" on public.uptime_checks for select using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', '')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter publication supabase_realtime add table public.monitoring_events;

create function public.project_metrics(p_project uuid, p_since timestamptz)
returns table(total_requests bigint, average_latency numeric, error_rate numeric, server_error_rate numeric, successful_requests bigint, client_errors bigint, server_errors bigint)
language sql stable security invoker set search_path = '' as $$
  select count(*), coalesce(avg(e.response_time),0), coalesce(100.0*count(*) filter(where e.status_code>=400)/nullif(count(*),0),0),
  coalesce(100.0*count(*) filter(where e.status_code>=500)/nullif(count(*),0),0), count(*) filter(where e.status_code<400),
  count(*) filter(where e.status_code between 400 and 499), count(*) filter(where e.status_code>=500)
  from public.monitoring_events e join public.projects p on p.id=e.project_id
  where p.user_id=(select auth.uid()) and (p_project is null or e.project_id=p_project) and e.occurred_at>=p_since;
$$;

create function public.event_timeseries(p_project uuid, p_since timestamptz, p_bucket_minutes integer)
returns table(bucket timestamptz, requests bigint, average_latency numeric, errors bigint)
language sql stable security invoker set search_path = '' as $$
  select to_timestamp(floor(extract(epoch from e.occurred_at)/(p_bucket_minutes*60))*(p_bucket_minutes*60)) as bucket,
  count(*), avg(e.response_time), count(*) filter(where e.status_code>=400)
  from public.monitoring_events e join public.projects p on p.id=e.project_id
  where p.user_id=(select auth.uid()) and (p_project is null or e.project_id=p_project) and e.occurred_at>=p_since
  group by 1 order by 1;
$$;
