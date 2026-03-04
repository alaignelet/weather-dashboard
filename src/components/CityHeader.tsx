"use client";

import { MapPin, Clock, Eye } from "lucide-react";
import { useTheme } from "next-themes";
import { useDashboard } from "@/context/DashboardContext";
import { useWeather } from "@/hooks/useWeather";
import { useCityImage } from "@/hooks/useCityImage";
import { WeatherIcon } from "./WeatherIcon";

export function CityHeader() {
  const { selectedCity } = useDashboard();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: weather } = useWeather(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );
  const { data: imageUrl } = useCityImage(selectedCity?.name);

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
    <div className="relative overflow-hidden rounded-3xl mb-12 h-[300px]">
      {/* Background image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={selectedCity.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.2))"
            : "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.5), rgba(255,255,255,0.1))",
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-7 h-7" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }} />
              <h2
                className="text-3xl lg:text-4xl font-extrabold tracking-tight"
                style={{ color: isDark ? "#fff" : "#0f172a", textShadow: isDark ? "none" : "0 1px 8px rgba(255,255,255,0.6)" }}
              >
                {selectedCity.name}, {selectedCity.country}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 font-medium" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)", textShadow: isDark ? "none" : "0 1px 6px rgba(255,255,255,0.5)" }}>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {localTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {visibilityKm}km Visibility
              </span>
              {weather && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold capitalize"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                    color: isDark ? "#fff" : "#0f172a",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {weather.description}
                </span>
              )}
            </div>
          </div>
          {weather && (
            <div
              className="flex items-center gap-6 lg:gap-8 p-4 lg:p-6 rounded-3xl"
              style={{
                background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)"}`,
              }}
            >
              <div className="text-right">
                <p className="text-5xl lg:text-6xl font-black tracking-tighter" style={{ color: isDark ? "#fff" : "#0f172a" }}>
                  {Math.round(weather.temp)}°
                  <span className="text-xl lg:text-2xl font-light uppercase" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>c</span>
                </p>
                <p className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}>
                  Feels like {Math.round(weather.feels_like)}°
                </p>
              </div>
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)" }}>
                <WeatherIcon main={weather.main} description={weather.description} size={48} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
