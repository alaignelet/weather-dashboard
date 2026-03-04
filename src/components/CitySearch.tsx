"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, X } from "lucide-react";
import { useCitySearch } from "@/hooks/useCities";
import { useDashboard } from "@/context/DashboardContext";
import type { City } from "@/lib/types";

export function CitySearch({ dropUp = false }: { dropUp?: boolean }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const { data: results } = useCitySearch(query);
  const { addCity } = useDashboard();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Position dropdown relative to the input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: dropUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, dropUp, query]);

  const handleSelect = (city: City) => {
    addCity(city);
    setQuery("");
    setIsOpen(false);
  };

  const showDropdown = isOpen && results && results.length > 0 && dropdownPos;

  return (
    <div ref={ref} className="relative">
      <div ref={inputRef} className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5">
        <Search className="w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search global cities..."
          aria-label="Search city"
          className="bg-transparent outline-none focus:ring-0 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full"
        />
        {query && (
          <button aria-label="Clear search" onClick={() => { setQuery(""); setIsOpen(false); }}>
            <X className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          </button>
        )}
      </div>

      {showDropdown && createPortal(
        <div
          ref={dropdownRef}
          className="fixed glass rounded-2xl p-2 max-h-[240px] overflow-y-auto"
          style={{
            zIndex: 9999,
            top: dropUp ? undefined : dropdownPos.top,
            bottom: dropUp ? `${window.innerHeight - dropdownPos.top}px` : undefined,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {results!.map((city, i) => (
            <button
              key={`${city.lat}-${city.lon}-${i}`}
              onClick={() => handleSelect(city)}
              className="w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-sm"
            >
              <span>
                {city.name}
                {city.state ? `, ${city.state}` : ""}, {city.country}
              </span>
              <Plus className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
