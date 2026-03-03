"use client";

import { MapPin } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useCityImage } from "@/hooks/useCityImage";
import { useWeather } from "@/hooks/useWeather";
import { WeatherIcon } from "./WeatherIcon";

export function CityImageCard() {
  const { selectedCity } = useDashboard();
  const { data: imageUrl, isLoading } = useCityImage(selectedCity?.name);
  const { data: weather } = useWeather(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card flex items-center justify-center h-full min-h-[200px] text-[var(--text-muted)]">
        <p className="text-sm">Select a city</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden h-full min-h-[200px] relative">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={selectedCity.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          <MapPin className="w-12 h-12 text-[var(--text-muted)]" />
        </div>
      )}
      {/* Overlay with city info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-white text-lg font-bold">{selectedCity.name}</h3>
            <p className="text-white/70 text-xs">{selectedCity.country}</p>
          </div>
          {weather && (
            <div className="flex items-center gap-2">
              <WeatherIcon main={weather.main} description={weather.description} size={32} />
              <span className="text-white text-2xl font-bold">
                {Math.round(weather.temp)}°
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
