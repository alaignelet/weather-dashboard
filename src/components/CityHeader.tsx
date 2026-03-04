"use client";

import { MapPin, Clock, Eye } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useWeather } from "@/hooks/useWeather";
import { WeatherIcon } from "./WeatherIcon";

export function CityHeader() {
  const { selectedCity } = useDashboard();
  const { data: weather } = useWeather(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) return null;

  const localTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const visibilityKm = weather
    ? (weather.visibility / 1000).toFixed(0)
    : "--";

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-8 h-8 text-[var(--primary)]" />
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            {selectedCity.name}, {selectedCity.country}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[var(--text-muted)] font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {localTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {visibilityKm}km Visibility
          </span>
          {weather && (
            <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-xs font-bold capitalize">
              {weather.description}
            </span>
          )}
        </div>
      </div>
      {weather && (
        <div className="flex items-center gap-6 lg:gap-8 bg-[var(--hover-bg)] p-4 lg:p-6 rounded-3xl border border-[var(--card-border)]">
          <div className="text-right">
            <p className="text-5xl lg:text-6xl font-black tracking-tighter">
              {Math.round(weather.temp)}°
              <span className="text-xl lg:text-2xl font-light text-[var(--text-muted)] uppercase">c</span>
            </p>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              Feels like {Math.round(weather.feels_like)}°
            </p>
          </div>
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
            <WeatherIcon main={weather.main} description={weather.description} size={48} />
          </div>
        </div>
      )}
    </div>
  );
}
