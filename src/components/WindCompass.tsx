"use client";

import { Wind } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useDashboard } from "@/context/DashboardContext";

function getWindDirection(deg: number): string {
  const dirs = ["North", "North East", "East", "South East", "South", "South West", "West", "North West"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

function getWindArrow(deg: number): string {
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const idx = Math.round(deg / 45) % 8;
  return arrows[idx];
}

function getWindTag(speed: number): string {
  if (speed < 3) return "Calm";
  if (speed < 8) return "Gentle";
  if (speed < 14) return "Moderate";
  if (speed < 20) return "Strong";
  return "Very Strong";
}

export function WindCompass() {
  const { selectedCity } = useDashboard();
  const { data: weather, isLoading } = useWeather(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[280px] text-[var(--text-muted)]">
        Select a city to view wind data
      </div>
    );
  }

  const windDeg = weather?.wind_deg ?? 0;
  const windSpeed = weather?.wind_speed ?? 0;

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <Wind className="w-5 h-5 text-[var(--text-muted)]" />
        <h3 className="text-lg lg:text-xl font-bold">Wind Metrics</h3>
      </div>

      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black">
                {Math.round(windSpeed)}
              </span>
              <span className="text-lg lg:text-xl font-semibold text-[var(--text-muted)] uppercase">
                m/s
              </span>
            </div>
            <span className="text-base lg:text-lg text-[var(--text-secondary)] font-bold mt-2">
              {getWindDirection(windDeg)}{" "}
              <span className="text-[var(--primary)] text-2xl ml-2">
                {getWindArrow(windDeg)}
              </span>
            </span>
            <div className="mt-6 lg:mt-8 flex gap-3">
              <div className="px-4 py-2 bg-[var(--hover-bg)] rounded-2xl text-xs font-bold border border-[var(--card-border)]">
                {getWindTag(windSpeed)}
              </div>
            </div>
          </div>
          <div className="relative w-28 h-28 lg:w-36 lg:h-36 border-4 border-[var(--card-border)] rounded-full flex items-center justify-center">
            <span className="absolute top-2 text-[10px] font-black text-[var(--text-muted)]">N</span>
            <span className="absolute right-2 text-[10px] font-black text-[var(--text-muted)]">E</span>
            <span className="absolute bottom-2 text-[10px] font-black text-[var(--text-muted)]">S</span>
            <span className="absolute left-2 text-[10px] font-black text-[var(--text-muted)]">W</span>
            <div
              className="w-1.5 h-16 lg:h-20 rounded-full relative"
              style={{
                background: "linear-gradient(to top, var(--primary), var(--accent))",
                transform: `rotate(${windDeg}deg)`,
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
              }}
            >
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "14px solid var(--accent)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
