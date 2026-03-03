"use client";

import { useState, useEffect } from "react";
import { Map as MapIcon } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useWeather } from "@/hooks/useWeather";
import dynamic from "next/dynamic";
import type { CityMarker } from "./LeafletMap";
import type { City } from "@/lib/types";

const WORLD_CITIES: City[] = [
  { name: "London", lat: 51.5074, lon: -0.1278, country: "GB" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "FR" },
  { name: "New York", lat: 40.7128, lon: -74.006, country: "US" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "JP" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, country: "AU" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, country: "AE" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, country: "SG" },
  { name: "Mumbai", lat: 19.076, lon: 72.8777, country: "IN" },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333, country: "BR" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, country: "EG" },
  { name: "Moscow", lat: 55.7558, lon: 37.6173, country: "RU" },
  { name: "Beijing", lat: 39.9042, lon: 116.4074, country: "CN" },
  { name: "Lagos", lat: 6.5244, lon: 3.3792, country: "NG" },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332, country: "MX" },
  { name: "Berlin", lat: 52.52, lon: 13.405, country: "DE" },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018, country: "TH" },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784, country: "TR" },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816, country: "AR" },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219, country: "KE" },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, country: "US" },
];

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
  const { selectedCity, cities } = useDashboard();
  const [markers, setMarkers] = useState<Map<string, CityMarker>>(new Map());

  const allCities = mergeAllCities(cities);

  const center: [number, number] = selectedCity
    ? [selectedCity.lat, selectedCity.lon]
    : [20, 0]; // world view

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
    <div className="glass-card p-6 overflow-hidden">
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

      <div className="rounded-lg overflow-hidden h-[300px]">
        <LeafletMap center={center} markers={Array.from(markers.values())} />
      </div>
    </div>
  );
}
