"use client";

import { useDashboard } from "@/context/DashboardContext";
import { CityCard } from "./CityCard";

export function CityCardsRow() {
  const { cities } = useDashboard();

  if (cities.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <p>No cities added. Search and add a city to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pt-2 pb-2 mb-6 px-1">
      {cities.map((city) => (
        <CityCard key={`${city.lat}-${city.lon}`} city={city} />
      ))}
    </div>
  );
}
