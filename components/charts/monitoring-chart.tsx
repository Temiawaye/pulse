"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint, Metrics } from "@/lib/types";

const tick = { fill: "var(--muted)", fontSize: 11 };

export function MonitoringChart({ data, metric = "requests" }: { data: ChartPoint[]; metric?: "requests" | "averageLatency" | "errors" }) {
  
  const label = metric === "averageLatency" ? "Latency (ms)" : metric === "errors" ? "Errors" : "Requests";
  
  return (
    <div 
      className="h-72 w-full" 
      role="img" 
      aria-label={`${label} over time. ${data.length} time buckets.`}
    >
      <ResponsiveContainer>
        <AreaChart 
          data={data} 
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient 
              id={`fill-${metric}`} 
              x1="0" y1="0" x2="0" y2="1"
            >
              <stop 
                offset="0" 
                stopColor="var(--accent)" 
                stopOpacity={.3} 
              />
              <stop 
                offset="1" 
                stopColor="var(--accent)" 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            stroke="var(--border)" 
          />
          <XAxis 
            dataKey="bucket" 
            tickFormatter={(v) => new Date(String(v)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} 
            tick={tick} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={28}
          />
          <YAxis 
            tick={tick} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }} 
            labelFormatter={(v) => new Date(String(v)).toLocaleString()} 
          />
          <Area 
            type="monotone" 
            dataKey={metric} 
            name={label} 
            stroke="var(--accent)" 
            strokeWidth={2} 
            fill={`url(#fill-${metric})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusChart({ metrics }: { metrics: Metrics }) { 
  
  const data = [
    { 
      name: "Success", 
      value: metrics.successfulRequests, 
      color: "var(--accent)" 
    }, 
    { 
      name: "Client error", 
      value: metrics.clientErrors, 
      color: "var(--warning)" 
    }, 
    { 
      name: "Server error", 
      value: metrics.serverErrors, 
      color: "var(--danger)" 
    } 
  ]; 
  
  return (
    <div 
      className="h-64" 
      role="img" 
      aria-label={`${metrics.successfulRequests} successful, ${metrics.clientErrors} client errors, ${metrics.serverErrors} server errors`}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            innerRadius={58} 
            outerRadius={86} 
            paddingAngle={2}
          > 
            {data.map((item) => <Cell key={item.name} fill={item.color} />)} 
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: "var(--surface)", 
              border: "1px solid var(--border)", 
              borderRadius: 6 
            }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  ); 
}

export function ErrorBars({ data }: { data: ChartPoint[] }) {
   return (
    <div className="h-64" role="img" aria-label="Errors by time bucket">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid 
            vertical={false} 
            stroke="var(--border)" />
          <XAxis 
            dataKey="bucket" 
            tickFormatter={(v) => new Date(v).toLocaleDateString()} 
            tick={tick} 
            axisLine={false} 
            tickLine={false} />
          <YAxis 
            tick={tick} 
            axisLine={false} 
            tickLine={false} />
          <Tooltip 
            contentStyle={{ 
              background: "var(--surface)", 
              border: "1px solid var(--border)" 
            }}/>
          <Bar 
            dataKey="errors" 
            fill="var(--danger)" 
            radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ); 
}
