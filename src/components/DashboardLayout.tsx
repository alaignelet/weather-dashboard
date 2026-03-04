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
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <main className="p-4 sm:p-6">
        {/* Top row: logo + toggle (always same line) */}
        <div className="flex items-center justify-between mb-3 sm:mb-0">
          <div className="flex items-center gap-3">
            <CloudSun className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">WeatherPulse</h1>
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
        <div className="sm:hidden mb-6">
          <CitySearch />
        </div>

        <div className="hidden sm:block mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <CityCardsRow />
          </div>
          <div className="h-[220px]">
            <CityImageCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ForecastChart />
          <WeatherMap />
          <AirQualityPanel />
          <HourlyChart />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <TemperatureRanking />
        </div>
      </main>
    </div>
  );
}
