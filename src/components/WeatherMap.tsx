"use client";

import { useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import dynamic from "next/dynamic";

type LayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

const LAYERS: { id: LayerType; label: string }[] = [
  { id: "temp_new", label: "Temp" },
  { id: "precipitation_new", label: "Rain" },
  { id: "clouds_new", label: "Clouds" },
  { id: "wind_new", label: "Wind" },
];

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
    </div>
  ),
});

export function WeatherMap() {
  const { selectedCity } = useDashboard();
  const [activeLayer, setActiveLayer] = useState<LayerType>("temp_new");

  const center: [number, number] = selectedCity
    ? [selectedCity.lat, selectedCity.lon]
    : [48.8566, 2.3522];

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Weather Map</h2>
        <div className="flex gap-1 ml-auto">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                activeLayer === layer.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden h-[240px]">
        <LeafletMap center={center} activeLayer={activeLayer} />
      </div>
    </div>
  );
}
