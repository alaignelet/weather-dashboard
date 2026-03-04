"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Trophy } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useDashboard } from "@/context/DashboardContext";
import { WeatherIcon } from "./WeatherIcon";
import { WORLD_CITIES, ZONES, type Zone, type ZonedCity } from "@/lib/cities";

function getTempColor(temp: number): string {
  if (temp <= 0) return "from-blue-600 to-blue-400";
  if (temp <= 10) return "from-blue-500 to-cyan-400";
  if (temp <= 20) return "from-cyan-400 to-green-400";
  if (temp <= 30) return "from-yellow-400 to-orange-400";
  return "from-orange-500 to-red-500";
}

/** Invisible component that fetches weather and reports temp back — stable hook count. */
function TempCollector({
  city,
  onTemp,
}: {
  city: ZonedCity;
  onTemp: (key: string, temp: number) => void;
}) {
  const { data } = useWeather(city.lat, city.lon);

  useEffect(() => {
    if (data?.temp != null) {
      onTemp(`${city.lat}-${city.lon}`, data.temp);
    }
  }, [city.lat, city.lon, data?.temp, onTemp]);

  return null;
}

const CityRow = memo(function CityRow({
  city,
  rank,
  isSelected,
  onSelect,
}: {
  city: ZonedCity;
  rank: number;
  isSelected: boolean;
  onSelect: (city: ZonedCity) => void;
}) {
  const { data: weather, isLoading } = useWeather(city.lat, city.lon);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg animate-pulse">
        <span className="w-6 text-center text-xs font-bold text-[var(--text-muted)]">{rank}</span>
        <div className="flex-1">
          <div className="h-4 bg-[var(--hover-bg)] rounded w-24" />
        </div>
        <div className="h-5 bg-[var(--hover-bg)] rounded w-10" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      onClick={() => onSelect(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(city); }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-150 ${
        isSelected ? "bg-blue-500/15 border-[var(--accent-blue)]/40" : "border-transparent hover-row"
      }`}
    >
      <span className="w-6 text-center text-xs font-bold text-[var(--text-muted)]">{rank}</span>
      <WeatherIcon main={weather.main} description={weather.description} size={22} />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{city.name}</span>
        <span className="text-xs text-[var(--text-muted)]">{city.country}</span>
      </div>
      <span
        className={`text-sm font-bold bg-gradient-to-r ${getTempColor(weather.temp)} bg-clip-text text-transparent`}
      >
        {Math.round(weather.temp)}°C
      </span>
    </div>
  );
});

export function TemperatureRanking() {
  const [zone, setZone] = useState<Zone>("world");
  const [temps, setTemps] = useState<Map<string, number>>(new Map());
  const { addCity, selectedCity } = useDashboard();

  const handleTemp = useCallback((key: string, temp: number) => {
    setTemps((prev) => {
      if (prev.get(key) === temp) return prev;
      const next = new Map(prev);
      next.set(key, temp);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (city: ZonedCity) => addCity(city),
    [addCity],
  );

  const filtered = useMemo(
    () => (zone === "world" ? WORLD_CITIES : WORLD_CITIES.filter((c) => c.zone === zone)),
    [zone],
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const ta = temps.get(`${a.lat}-${a.lon}`) ?? -Infinity;
        const tb = temps.get(`${b.lat}-${b.lon}`) ?? -Infinity;
        return tb - ta;
      }),
    [filtered, temps],
  );

  const selectedKey = selectedCity ? `${selectedCity.lat}-${selectedCity.lon}` : null;

  return (
    <div className="glass-card p-4 sm:p-5 h-full flex flex-col">
      {/* Always render collectors for ALL cities — stable hook count */}
      {WORLD_CITIES.map((city) => (
        <TempCollector key={`col-${city.lat}-${city.lon}`} city={city} onTemp={handleTemp} />
      ))}

      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="font-semibold">Temperature Ranking</h2>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{filtered.length} cities</span>
      </div>

      {/* Zone pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ZONES.map((z) => (
          <button
            key={z.key}
            onClick={() => setZone(z.key)}
            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
              zone === z.key
                ? "bg-blue-500/20 text-blue-400 border border-blue-400/50"
                : "bg-[var(--hover-bg)] text-[var(--text-secondary)] border border-transparent hover-row"
            }`}
          >
            {z.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto max-h-[400px] scrollbar-hide">
        {sorted.map((city, i) => (
          <CityRow
            key={`${city.lat}-${city.lon}`}
            city={city}
            rank={i + 1}
            isSelected={`${city.lat}-${city.lon}` === selectedKey}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
