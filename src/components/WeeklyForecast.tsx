"use client";

import { CalendarDays } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";
import { WeatherIcon } from "./WeatherIcon";

interface DayData {
  day: string;
  temp_max: number;
  temp_min: number;
  main: string;
  description: string;
}

export function WeeklyForecast() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[280px] text-[var(--text-muted)]">
        Select a city to view forecast
      </div>
    );
  }

  const days: DayData[] = forecast
    ? Object.values(
        forecast.reduce(
          (acc, entry) => {
            const day = new Date(entry.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
            });
            if (!acc[day]) {
              acc[day] = {
                day,
                temp_max: entry.temp_max,
                temp_min: entry.temp_min,
                main: entry.main,
                description: entry.description,
              };
            } else {
              acc[day].temp_max = Math.max(acc[day].temp_max, entry.temp_max);
              acc[day].temp_min = Math.min(acc[day].temp_min, entry.temp_min);
            }
            return acc;
          },
          {} as Record<string, DayData>
        )
      ).slice(0, 7)
    : [];

  return (
    <div className="glass-card p-4 sm:p-6 lg:p-8 overflow-visible">
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 px-2">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-base sm:text-lg lg:text-xl font-bold">Weekly Forecast</h3>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide sm:grid sm:overflow-visible p-2" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((d, i) => (
            <div
              key={d.day}
              className={`flex flex-col items-center p-3 sm:p-4 lg:p-6 rounded-[1.5rem] sm:rounded-[2rem] transition-all min-w-[72px] sm:min-w-0 ${
                i === 0
                  ? "bg-gradient-to-b from-[var(--primary)] to-[var(--accent)] text-white shadow-sm sm:shadow-xl shadow-[var(--primary)]/20 sm:scale-105"
                  : "hover:bg-[var(--hover-bg)] border border-transparent hover:border-[var(--card-border)]"
              }`}
            >
              <span
                className={`text-[10px] sm:text-xs font-bold mb-2 sm:mb-4 uppercase tracking-wider ${
                  i === 0 ? "opacity-80" : "text-[var(--text-muted)]"
                }`}
              >
                {d.day}
              </span>
              <div className="mb-2 sm:mb-4 lg:mb-5">
                <WeatherIcon main={d.main} description={d.description} size={52} />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-black">
                {Math.round(d.temp_max)}°
              </span>
              <span
                className={`text-[10px] sm:text-xs mt-1 ${
                  i === 0 ? "opacity-70" : "text-[var(--text-muted)]"
                }`}
              >
                {Math.round(d.temp_min)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
