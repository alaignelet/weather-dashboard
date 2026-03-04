"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Clock } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";

function getTempBarColor(temp: number): string {
  if (temp <= 0) return "#60a5fa";
  if (temp <= 10) return "#22d3ee";
  if (temp <= 20) return "#4ade80";
  if (temp <= 30) return "#fb923c";
  return "#f87171";
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--tooltip-bg)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: 12,
      padding: "8px 12px",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--tooltip-text)" }}>{payload[0].value}°C</div>
    </div>
  );
}

export function HourlyChart() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-[var(--text-muted)]">
        Select a city to view hourly data
      </div>
    );
  }

  const hourlyData = forecast
    ? forecast.slice(0, 8).map((entry) => ({
        time: new Date(entry.dt * 1000).toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }),
        temp: Math.round(entry.temp),
      }))
    : [];

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg lg:text-xl font-bold">Hourly Forecast</h3>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Next 24h</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={hourlyData} barCategoryGap="20%">
            <XAxis
              dataKey="time"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}°`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="temp" radius={[10, 10, 0, 0]}>
              {hourlyData.map((entry, index) => (
                <Cell key={index} fill={getTempBarColor(entry.temp)} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
