"use client";

import { X, Droplets, Wind, Thermometer } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useDashboard } from "@/context/DashboardContext";
import { WeatherIcon } from "./WeatherIcon";
import type { City } from "@/lib/types";

function getTempColor(temp: number): string {
  if (temp <= 0) return "from-blue-600 to-blue-400";
  if (temp <= 10) return "from-blue-500 to-cyan-400";
  if (temp <= 20) return "from-cyan-400 to-green-400";
  if (temp <= 30) return "from-yellow-400 to-orange-400";
  return "from-orange-500 to-red-500";
}

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const { data: weather, isLoading } = useWeather(city.lat, city.lon);
  const { selectedCity, selectCity, removeCity } = useDashboard();
  const isSelected = selectedCity?.lat === city.lat && selectedCity?.lon === city.lon;

  return (
    <div
      onClick={() => selectCity(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") selectCity(city); }}
      className={`glass p-4 lg:p-6 min-w-[240px] sm:min-w-[280px] rounded-3xl text-left transition-all duration-300 cursor-pointer snap-center ${
        isSelected
          ? "border-2 border-[var(--primary)]/50 scale-105 shadow-[var(--primary)]/10"
          : "opacity-80 hover:opacity-100 hover:border-[var(--primary)]/30"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          {isSelected && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
              Live Tracking
            </span>
          )}
          <h3 className="font-bold text-base lg:text-lg leading-tight">{city.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">{city.country}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCity(city);
          }}
          aria-label={`Remove ${city.name}`}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-[var(--hover-bg)] rounded w-20" />
          <div className="h-4 bg-[var(--hover-bg)] rounded w-32" />
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <WeatherIcon main={weather.main} description={weather.description} size={40} />
            <span
              className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${getTempColor(weather.temp)} bg-clip-text text-transparent`}
            >
              {Math.round(weather.temp)}°
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] capitalize mb-3">{weather.description}</p>
          <div className="flex gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3" />
              {Math.round(weather.feels_like)}°
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {weather.wind_speed}m/s
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">No data</p>
      )}
    </div>
  );
}
