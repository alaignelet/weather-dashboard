"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Clock } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";

function getTempBarColor(temp: number): string {
  if (temp <= 0) return "#3b82f6";
  if (temp <= 10) return "#06b6d4";
  if (temp <= 20) return "#22c55e";
  if (temp <= 30) return "#f97316";
  return "#ef4444";
}

export function HourlyChart() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-slate-500">
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
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Next 24 Hours</h2>
        <span className="text-xs text-slate-400 ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#e2e8f0",
              }}
              formatter={(value: number | undefined) => [`${value ?? 0}°C`, "Temperature"]}
            />
            <Bar dataKey="temp" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry, index) => (
                <Cell key={index} fill={getTempBarColor(entry.temp)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
