create function public.filtered_metrics(p_project uuid, p_since timestamptz, p_status text default null, p_endpoint text default null)
returns table(total_requests bigint, average_latency numeric, error_rate numeric, server_error_rate numeric, successful_requests bigint, client_errors bigint, server_errors bigint)
language sql stable security invoker set search_path = '' as $$
  select count(*), coalesce(avg(e.response_time),0), coalesce(100.0*count(*) filter(where e.status_code>=400)/nullif(count(*),0),0),
  coalesce(100.0*count(*) filter(where e.status_code>=500)/nullif(count(*),0),0), count(*) filter(where e.status_code<400),
  count(*) filter(where e.status_code between 400 and 499), count(*) filter(where e.status_code>=500)
  from public.monitoring_events e join public.projects p on p.id=e.project_id
  where p.user_id=(select auth.uid()) and (p_project is null or e.project_id=p_project) and e.occurred_at>=p_since
  and (p_endpoint is null or e.path ilike '%' || p_endpoint || '%')
  and (p_status is null or (p_status='2xx' and e.status_code between 200 and 299) or (p_status='3xx' and e.status_code between 300 and 399) or (p_status='4xx' and e.status_code between 400 and 499) or (p_status='5xx' and e.status_code between 500 and 599));
$$;

create function public.filtered_timeseries(p_project uuid, p_since timestamptz, p_bucket_minutes integer, p_status text default null, p_endpoint text default null)
returns table(bucket timestamptz, requests bigint, average_latency numeric, errors bigint)
language sql stable security invoker set search_path = '' as $$
  select to_timestamp(floor(extract(epoch from e.occurred_at)/(p_bucket_minutes*60))*(p_bucket_minutes*60)), count(*), avg(e.response_time), count(*) filter(where e.status_code>=400)
  from public.monitoring_events e join public.projects p on p.id=e.project_id
  where p.user_id=(select auth.uid()) and (p_project is null or e.project_id=p_project) and e.occurred_at>=p_since
  and (p_endpoint is null or e.path ilike '%' || p_endpoint || '%')
  and (p_status is null or (p_status='2xx' and e.status_code between 200 and 299) or (p_status='3xx' and e.status_code between 300 and 399) or (p_status='4xx' and e.status_code between 400 and 499) or (p_status='5xx' and e.status_code between 500 and 599)) group by 1 order by 1;
$$;

create function public.endpoint_performance(p_project uuid, p_since timestamptz, p_limit integer default 5)
returns table(path text, requests bigint, average_latency numeric, max_latency integer)
language sql stable security invoker set search_path = '' as $$
 select e.path, count(*), avg(e.response_time), max(e.response_time) from public.monitoring_events e join public.projects p on p.id=e.project_id
 where p.user_id=(select auth.uid()) and (p_project is null or e.project_id=p_project) and e.occurred_at>=p_since
 group by e.path order by avg(e.response_time) desc limit p_limit;
$$;
