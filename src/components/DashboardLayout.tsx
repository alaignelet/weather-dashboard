"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, CloudSun } from "lucide-react";
import { CitySearch } from "./CitySearch";
import { CityCardsRow } from "./CityCardsRow";
import { ForecastChart } from "./ForecastChart";
import { WeatherMap } from "./WeatherMap";
import { AirQualityPanel } from "./AirQualityPanel";
import { HourlyChart } from "./HourlyChart";
import { CityImageCard } from "./CityImageCard";
import { TemperatureRanking } from "./TemperatureRanking";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  if (!mounted) return <div className="w-9 h-9 flex-shrink-0" />;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="glass-card p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <main className="max-w-[1400px] mx-auto p-4 sm:p-6">
        {/* Top row: logo + toggle (always same line) */}
        <div className="flex items-center justify-between mb-3 sm:mb-0">
          <div className="flex items-center gap-3">
            <CloudSun className="w-7 h-7 text-[var(--accent-blue)] flex-shrink-0" />
            <h1 className="text-xl font-semibold tracking-tight whitespace-nowrap">WeatherPulse</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Search visible on desktop inline */}
            <div className="hidden sm:block">
              <CitySearch />
            </div>
            <ThemeToggle />
          </div>
        </div>
        {/* Search on its own row on mobile */}
        <div className="sm:hidden mb-4">
          <CitySearch />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <CityCardsRow />
          </div>
          <div className="h-[180px] sm:h-[220px]">
            <CityImageCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <ForecastChart />
          <WeatherMap />
          <AirQualityPanel />
          <HourlyChart />
        </div>
        <TemperatureRanking />
      </main>
    </div>
  );
}
