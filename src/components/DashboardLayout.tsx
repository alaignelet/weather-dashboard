"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Header } from "./Header";
import { CityCardsRow } from "./CityCardsRow";
import { ForecastChart } from "./ForecastChart";
import { WeatherMap } from "./WeatherMap";
import { AirQualityPanel } from "./AirQualityPanel";
import { HourlyChart } from "./HourlyChart";
import { CityImageCard } from "./CityImageCard";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="glass-card p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="p-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Header />
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <CityCardsRow />
          </div>
          <div className="h-[220px]">
            <CityImageCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ForecastChart />
          <WeatherMap />
          <AirQualityPanel />
          <HourlyChart />
        </div>
      </main>
    </div>
  );
}
