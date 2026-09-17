create table public.ingestion_rate_limits (
  key_hash text not null, window_start timestamptz not null, request_count integer not null default 1,
  primary key (key_hash, window_start)
);
alter table public.ingestion_rate_limits enable row level security;

create function public.check_ingestion_rate(p_key_hash text, p_limit integer default 120)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_window timestamptz := date_trunc('minute', now()); current_count integer;
begin
  delete from public.ingestion_rate_limits where window_start < now() - interval '10 minutes';
  insert into public.ingestion_rate_limits(key_hash, window_start, request_count) values (p_key_hash, current_window, 1)
  on conflict (key_hash, window_start) do update set request_count = public.ingestion_rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= p_limit;
end; $$;
revoke all on function public.check_ingestion_rate(text, integer) from public, anon, authenticated;
grant execute on function public.check_ingestion_rate(text, integer) to service_role;
