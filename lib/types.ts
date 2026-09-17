export type Environment = "production" | "staging" | "development";
export type TimeRange = "1h" | "24h" | "7d" | "30d";

export interface Project {
  id: string;
  public_id: string;
  user_id: string;
  name: string;
  url: string;
  environment: Environment;
  created_at: string;
  last_event_at?: string | null;
}

export interface MonitoringEvent {
  id: string;
  project_id: string;
  method: string;
  path: string;
  status_code: number;
  response_time: number;
  user_agent: string | null;
  region: string | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
  project?: Pick<Project, "name" | "public_id">;
}

export interface Metrics {
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
  serverErrorRate: number;
  successfulRequests: number;
  clientErrors: number;
  serverErrors: number;
  requestsPerMinute: number;
}

export interface ChartPoint {
  bucket: string;
  requests: number;
  averageLatency: number;
  errors: number;
}
