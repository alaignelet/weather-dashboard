"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import { CalendarDays } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";

export function ForecastChart() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-slate-500">
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
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">5-Day Forecast</h2>
        <span className="text-xs text-slate-400 ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${Math.round(v)}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#e2e8f0",
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                `${Math.round(value ?? 0)}°C`,
                name === "temp_max" ? "High" : name === "temp_min" ? "Low" : "Precip",
              ]}
            />
            <Line
              type="monotone"
              dataKey="temp_max"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: "#f97316", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="temp_min"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="pop"
              fill="rgba(59,130,246,0.1)"
              stroke="none"
              yAxisId={0}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
