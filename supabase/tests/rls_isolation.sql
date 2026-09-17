begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000001', 'owner-a@example.test'), ('00000000-0000-0000-0000-000000000002', 'owner-b@example.test');
insert into public.projects (id, public_id, user_id, name, url, environment, api_key_hash, api_key_prefix) values
('10000000-0000-0000-0000-000000000001', 'prj_testowner_a', '00000000-0000-0000-0000-000000000001', 'Owner A', 'https://a.example.test', 'development', repeat('a',64), 'pulse_live_a'),
('10000000-0000-0000-0000-000000000002', 'prj_testowner_b', '00000000-0000-0000-0000-000000000002', 'Owner B', 'https://b.example.test', 'development', repeat('b',64), 'pulse_live_b');
insert into public.monitoring_events(project_id, method, path, status_code, response_time) values
('10000000-0000-0000-0000-000000000001','GET','/owner-a',200,10), ('10000000-0000-0000-0000-000000000002','GET','/owner-b',200,10);
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$ begin
  if (select count(*) from public.projects) <> 1 then raise exception 'project RLS isolation failed'; end if;
  if (select count(*) from public.monitoring_events) <> 1 then raise exception 'event RLS isolation failed'; end if;
  if exists (select 1 from public.monitoring_events where path='/owner-b') then raise exception 'cross-user event leaked'; end if;
end $$;
rollback;
