"use client";

import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ComposedChart,
} from "recharts";
import { CalendarDays } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const high = payload.find((p) => p.dataKey === "temp_max");
  const low = payload.find((p) => p.dataKey === "temp_min");
  return (
    <div style={{
      background: "var(--tooltip-bg)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: 12,
      padding: "8px 12px",
      color: "var(--tooltip-text)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {high && (
        <div style={{ fontSize: 13, color: "var(--accent-orange)", fontWeight: 600 }}>
          High: {Math.round(high.value)}°C
        </div>
      )}
      {low && (
        <div style={{ fontSize: 13, color: "var(--accent-blue)", fontWeight: 600 }}>
          Low: {Math.round(low.value)}°C
        </div>
      )}
    </div>
  );
}

export function ForecastChart() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-[var(--text-muted)]">
        Select a city to view forecast
      </div>
    );
  }

  const dailyData = forecast
    ? Object.values(
        forecast.reduce(
          (acc, entry) => {
            const date = new Date(entry.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            if (!acc[date]) {
              acc[date] = {
                date,
                temp_max: entry.temp_max,
                temp_min: entry.temp_min,
                pop: entry.pop,
              };
            } else {
              acc[date].temp_max = Math.max(acc[date].temp_max, entry.temp_max);
              acc[date].temp_min = Math.min(acc[date].temp_min, entry.temp_min);
              acc[date].pop = Math.max(acc[date].pop, entry.pop);
            }
            return acc;
          },
          {} as Record<
            string,
            { date: string; temp_max: number; temp_min: number; pop: number }
          >
        )
      ).slice(0, 5)
    : [];

  return (
    <div className="glass-card p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-[var(--accent-blue)]" />
        <h2 className="font-semibold">5-Day Forecast</h2>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[220px]">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" className="flex-1" height="100%">
          <ComposedChart data={dailyData}>
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v)}°`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
<Line
              type="monotone"
              dataKey="temp_max"
              stroke="#fb923c"
              strokeWidth={2}
              dot={{ fill: "#fb923c", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#fb923c", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="temp_min"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ fill: "#60a5fa", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#60a5fa", strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
