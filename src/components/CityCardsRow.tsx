"use client";

import { useEffect, useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { CityCard } from "./CityCard";

export function CityCardsRow() {
  const { cities, selectedCity, selectToken } = useDashboard();
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!selectedCity) return;
    const key = `${selectedCity.lat}-${selectedCity.lon}`;
    const el = cardRefs.current.get(key);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedCity, selectToken]);

  if (cities.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-[var(--text-muted)]">
        <p>No cities added. Search and add a city to get started.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-6 px-4 sm:px-6 lg:px-12 snap-x">
      {cities.map((city) => {
        const key = `${city.lat}-${city.lon}`;
        return (
          <div key={key} ref={(el) => { if (el) cardRefs.current.set(key, el); }}>
            <CityCard city={city} />
          </div>
        );
      })}
    </div>
  );
}
