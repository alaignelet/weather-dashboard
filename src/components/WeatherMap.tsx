"use client";

import { useState, useEffect, useCallback } from "react";
import { Map as MapIcon } from "lucide-react";
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
      <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
    </div>
  ),
});

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

  const allCities = mergeAllCities(cities);

  const center: [number, number] = selectedCity
    ? [selectedCity.lat, selectedCity.lon]
    : [20, 0]; // world view

  const handleMarkerClick = useCallback((marker: CityMarker) => {
    addCity({ name: marker.name, lat: marker.lat, lon: marker.lon, country: marker.country ?? "" });
  }, [addCity]);

  const handleMarkerData = (marker: CityMarker) => {
    setMarkers((prev) => {
      const key = `${marker.lat}-${marker.lon}`;
      const existing = prev.get(key);
      if (existing?.temp === marker.temp && existing?.main === marker.main) return prev;
      const next = new Map(prev);
      next.set(key, marker);
      return next;
    });
  };

  return (
    <div className="glass-card p-6 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Weather Map</h2>
        <span className="text-xs text-slate-400 ml-auto">
          {allCities.length} cities worldwide
        </span>
      </div>

      {allCities.map((city) => (
        <CityMarkerData
          key={`${city.lat}-${city.lon}`}
          city={city}
          onData={handleMarkerData}
        />
      ))}

      <div className="rounded-lg overflow-hidden h-[300px] flex-1 min-h-[300px]">
        <LeafletMap center={center} selectToken={selectToken} markers={Array.from(markers.values())} onMarkerClick={handleMarkerClick} />
      </div>
    </div>
  );
}
