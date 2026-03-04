"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { useCitySearch } from "@/hooks/useCities";
import { useDashboard } from "@/context/DashboardContext";
import type { City } from "@/lib/types";

export function CitySearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: results } = useCitySearch(query);
  const { addCity } = useDashboard();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (city: City) => {
    addCity(city);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 glass-card px-3 py-2">
        <Search className="w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city..."
          aria-label="Search city"
          className="bg-transparent outline-none focus:ring-0 text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full sm:w-48"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => { setQuery(""); setIsOpen(false); }}>
            <X className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          </button>
        )}
      </div>

      {isOpen && results && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-card p-2 z-50 max-h-[240px] overflow-y-auto">
          {results.map((city, i) => (
            <button
              key={`${city.lat}-${city.lon}-${i}`}
              onClick={() => handleSelect(city)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-sm"
            >
              <span>
                {city.name}
                {city.state ? `, ${city.state}` : ""}, {city.country}
              </span>
              <Plus className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
