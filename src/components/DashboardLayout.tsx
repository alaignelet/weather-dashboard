"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Plus } from "lucide-react";
import { CitySearch } from "./CitySearch";
import { CityCardsRow } from "./CityCardsRow";
import { CityHeader } from "./CityHeader";
import { WeeklyForecast } from "./WeeklyForecast";
import { ForecastChart } from "./ForecastChart";
import { WeatherMap } from "./WeatherMap";
import { AirQualityPanel } from "./AirQualityPanel";
import { HourlyChart } from "./HourlyChart";
import { WindCompass } from "./WindCompass";
import { TemperatureRanking } from "./TemperatureRanking";
import { useDashboard } from "@/context/DashboardContext";

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  if (!mounted) return <div className="w-12 h-12 flex-shrink-0" />;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--hover-bg)] hover:bg-[var(--card-border)] transition-all group overflow-hidden"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400 group-hover:-rotate-12 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--text-secondary)] group-hover:rotate-45 transition-transform" />
      )}
    </button>
  );
}

function FABButton() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)",
        }}
        aria-label="Track new city"
      >
        <Plus className="w-8 h-8" />
        <span className="absolute right-full mr-6 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl">
          Track New City
        </span>
      </button>
      {showSearch && (
        <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-10 z-[100] w-72">
          <CitySearch dropUp />
        </div>
      )}
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Glass Navbar — sits behind the map, reappears below it */}
      <header className="fixed top-0 left-0 right-0 z-[45] h-20 flex items-center px-4 sm:px-6 lg:px-8 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--card-border)]">
        <div className="flex items-center gap-3 mr-8 lg:mr-12 cursor-pointer group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            style={{
              background: "var(--primary)",
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
            }}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">
            WeatherDash
          </h1>
        </div>

        {/* Search - desktop */}
        <div className="hidden md:block flex-1 max-w-xl">
          <CitySearch />
        </div>

        <div className="flex items-center gap-4 lg:gap-6 ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile search */}
      <div className="md:hidden fixed top-20 left-0 right-0 z-[45] px-4 py-3 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--card-border)]">
        <CitySearch />
      </div>

      {/* Main content */}
      <main className="pt-20">
        {/* Map Hero Section */}
        <section className="relative z-[50] h-[60vh] sm:h-[50vh] lg:h-[65vh] w-full bg-[var(--background)] overflow-hidden">
          <WeatherMap />

          {/* Gradient fade behind city cards */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent z-[999] pointer-events-none" />

          {/* City Cards Overlay at bottom - z-[1000] to sit above Leaflet layers */}
          <div className="absolute bottom-0 left-0 right-0 z-[1000]">
            <CityCardsRow />
          </div>
        </section>

        {/* Content Section - overlapping map */}
        <div
          className="relative z-[40] -mt-4 p-4 sm:p-6 lg:p-12"
          style={{
            background: "var(--content-bg)",
            boxShadow: "0 -20px 50px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <CityHeader />

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              {/* Weekly Forecast - 8 cols */}
              <ScrollReveal className="col-span-12 lg:col-span-8">
                <WeeklyForecast />
              </ScrollReveal>

              {/* Air Quality - 4 cols */}
              <ScrollReveal className="col-span-12 lg:col-span-4" delay={0.1}>
                <AirQualityPanel />
              </ScrollReveal>

              {/* Hourly Chart - 6 cols */}
              <ScrollReveal className="col-span-12 lg:col-span-6">
                <HourlyChart />
              </ScrollReveal>

              {/* Wind Compass - 6 cols */}
              <ScrollReveal className="col-span-12 lg:col-span-6" delay={0.1}>
                <WindCompass />
              </ScrollReveal>

              {/* 5-Day Forecast Chart - 12 cols */}
              <ScrollReveal className="col-span-12">
                <ForecastChart />
              </ScrollReveal>

              {/* Temperature Ranking - 12 cols */}
              <ScrollReveal className="col-span-12">
                <TemperatureRanking />
              </ScrollReveal>
            </div>

          </div>
        </div>
      </main>

      <FABButton />
    </div>
  );
}
