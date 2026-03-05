"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useWeather } from "@/hooks/useWeather";
import dynamic from "next/dynamic";
import type { CityMarker } from "./LeafletMap";
import type { City } from "@/lib/types";
import { WORLD_CITIES } from "@/lib/cities";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full" />
    </div>
  ),
});

// Register tile-caching service worker once
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/tile-cache-sw.js").catch(() => {});
}

// Each city gets its own component so useWeather is called correctly per hook rules
function CityMarkerData({ city, onData }: { city: City; onData: (marker: CityMarker) => void }) {
  const { data: weather } = useWeather(city.lat, city.lon);

  useEffect(() => {
    onData({
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: city.country,
      temp: weather?.temp,
      main: weather?.main,
      description: weather?.description,
    });
  }, [city, weather, onData]);

  return null;
}

// Merge user cities + world cities, deduplicating by proximity
function mergeAllCities(userCities: City[]): City[] {
  const all = new Map<string, City>();
  // World cities first
  for (const c of WORLD_CITIES) {
    all.set(`${Math.round(c.lat)}-${Math.round(c.lon)}`, c);
  }
  // User cities override (same rounded coords = same city)
  for (const c of userCities) {
    all.set(`${Math.round(c.lat)}-${Math.round(c.lon)}`, c);
  }
  return Array.from(all.values());
}

export function WeatherMap() {
  const { selectedCity, selectToken, cities, addCity } = useDashboard();
  const [markers, setMarkers] = useState<Map<string, CityMarker>>(new Map());

  const allCities = useMemo(() => mergeAllCities(cities), [cities]);

  const center: [number, number] = useMemo(() => selectedCity
    ? [selectedCity.lat, selectedCity.lon]
    : [20, 0], [selectedCity]);

  const handleMarkerClick = useCallback((marker: CityMarker) => {
    addCity({ name: marker.name, lat: marker.lat, lon: marker.lon, country: marker.country ?? "" });
  }, [addCity]);

  const handleMarkerData = useCallback((marker: CityMarker) => {
    setMarkers((prev) => {
      const key = `${marker.lat}-${marker.lon}`;
      const existing = prev.get(key);
      if (existing?.temp === marker.temp && existing?.main === marker.main) return prev;
      const next = new Map(prev);
      next.set(key, marker);
      return next;
    });
  }, []);

  const markersList = useMemo(() => Array.from(markers.values()), [markers]);
  const selectedCoords = useMemo(() => selectedCity ? { lat: selectedCity.lat, lon: selectedCity.lon } : null, [selectedCity]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {allCities.map((city) => (
        <CityMarkerData
          key={`${city.lat}-${city.lon}`}
          city={city}
          onData={handleMarkerData}
        />
      ))}

      <LeafletMap
        center={center}
        selectToken={selectToken}
        markers={markersList}
        selectedCoords={selectedCoords}
        onMarkerClick={handleMarkerClick}
      />
    </div>
  );
}
