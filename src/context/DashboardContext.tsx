"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { City } from "@/lib/types";

interface DashboardState {
  cities: City[];
  selectedCity: City | null;
  selectToken: number;
  addCity: (city: City) => void;
  removeCity: (city: City) => void;
  selectCity: (city: City) => void;
}

const DashboardContext = createContext<DashboardState | null>(null);

const STORAGE_KEY = "weatherpulse-cities";

const DEFAULT_CITIES: City[] = [
  { name: "Paris", lat: 48.8566, lon: 2.3522, country: "FR" },
  { name: "New York", lat: 40.7128, lon: -74.006, country: "US", state: "New York" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "JP" },
];

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectToken, setSelectToken] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as City[];
        if (parsed.length > 0) setCities(parsed);
      } catch {
        // ignore invalid JSON
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    }
  }, [cities, hydrated]);

  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity]);

  const addCity = (city: City) => {
    setCities((prev) => {
      const idx = prev.findIndex((c) => c.lat === city.lat && c.lon === city.lon);
      if (idx === -1) return [...prev, city];
      // Update existing entry if new data is more complete
      const existing = prev[idx];
      if ((!existing.country && city.country) || (!existing.state && city.state)) {
        const updated = [...prev];
        updated[idx] = { ...existing, ...city };
        return updated;
      }
      return prev;
    });
    setSelectedCity(city);
    setSelectToken((t) => t + 1);
  };

  const removeCity = (city: City) => {
    setCities((prev) => prev.filter((c) => !(c.lat === city.lat && c.lon === city.lon)));
    if (selectedCity?.lat === city.lat && selectedCity?.lon === city.lon) {
      setSelectedCity(cities.length > 1 ? cities[0] : null);
    }
  };

  const selectCity = (city: City) => {
    setSelectedCity(city);
    setSelectToken((t) => t + 1);
  };

  return (
    <DashboardContext.Provider value={{ cities, selectedCity, selectToken, addCity, removeCity, selectCity }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
