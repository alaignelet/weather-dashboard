# Futuristic Glass Weather Dashboard - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the weather dashboard to a futuristic glass morphism aesthetic with map-centric layout, based on Stitch AI Screen 3 mockups.

**Architecture:** The layout changes from a flat 2-column grid to a vertically flowing design: fixed glass navbar -> 65vh map hero with overlaid city cards -> content section with rounded overlap. All existing data hooks, API routes, and state management remain unchanged. New components: WeeklyForecast, WindCompass, CityHeader, FAB button.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Plus Jakarta Sans, Recharts, Leaflet, Framer Motion, Lucide React

**Design Reference:** `docs/plans/2026-03-04-futuristic-glass-redesign-design.md` and `/tmp/stitch-screen3.html`

---

### Task 1: Update Font & Design Tokens

**Files:**
- Modify: `src/app/layout.tsx` (lines 2, 6, 20)
- Modify: `src/app/globals.css` (full rewrite)

**Step 1: Update layout.tsx to use Plus Jakarta Sans**

Replace Inter import with Plus Jakarta Sans:

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WeatherDash",
  description: "Real-time weather dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakarta.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 2: Rewrite globals.css with new design tokens**

```css
/* src/app/globals.css */
@import "tailwindcss";

/* Light theme */
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --card-bg: rgba(255, 255, 255, 0.4);
  --card-border: rgba(255, 255, 255, 0.2);
  --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  --card-highlight: none;
  --primary: #3b82f6;
  --accent: #6366f1;
  --accent-blue: #3b82f6;
  --accent-orange: #ea580c;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --tooltip-bg: rgba(255, 255, 255, 0.95);
  --tooltip-text: #1e293b;
  --tooltip-border: rgba(0, 0, 0, 0.1);
  --hover-bg: rgba(0, 0, 0, 0.04);
  --nav-bg: rgba(255, 255, 255, 0.1);
  --content-bg: #ffffff;
}

/* Dark theme */
.dark {
  --background: #020617;
  --foreground: #f1f5f9;
  --card-bg: rgba(15, 23, 42, 0.4);
  --card-border: rgba(51, 65, 85, 0.3);
  --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --card-highlight: none;
  --primary: #3b82f6;
  --accent: #6366f1;
  --accent-blue: #60a5fa;
  --accent-orange: #fb923c;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --tooltip-bg: rgba(15, 23, 42, 0.95);
  --tooltip-text: #e2e8f0;
  --tooltip-border: rgba(255, 255, 255, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.06);
  --nav-bg: rgba(2, 6, 23, 0.1);
  --content-bg: #0f172a;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
  transition: background 0.5s ease, color 0.5s ease;
}

/* Glass morphism card */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--card-border);
  border-radius: 2.5rem;
  box-shadow: var(--card-shadow);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Glass utility (for overlaid elements) */
.glass {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}

/* Pulse dot for map markers */
.pulse-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--primary), 0 0 30px var(--primary);
  cursor: pointer;
}
.pulse-dot::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.4);
  animation: pulse-expand 2s infinite;
}
@keyframes pulse-expand {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(4); opacity: 0; }
}

/* Theme-aware hover for ranking rows */
.hover-row {
  transition: background 150ms ease;
}
.hover-row:hover {
  background: var(--hover-bg);
}

/* Hide Leaflet attribution */
.leaflet-control-attribution {
  display: none !important;
}

/* Custom scrollbar hiding */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Accessibility: respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: update design tokens to futuristic glass theme with Plus Jakarta Sans"
```

---

### Task 2: Create CityHeader Component

**Files:**
- Create: `src/components/CityHeader.tsx`

**Step 1: Create CityHeader component**

This component shows the selected city name, local time, visibility, weather condition, and large temperature display. It sits between the map hero and the content grid.

```tsx
// src/components/CityHeader.tsx
"use client";

import { MapPin, Clock, Eye } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useWeather } from "@/hooks/useWeather";
import { WeatherIcon } from "./WeatherIcon";

export function CityHeader() {
  const { selectedCity } = useDashboard();
  const { data: weather } = useWeather(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) return null;

  const localTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const visibilityKm = weather
    ? (weather.visibility / 1000).toFixed(0)
    : "--";

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-8 h-8 text-[var(--primary)]" />
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            {selectedCity.name}, {selectedCity.country}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-[var(--text-muted)] font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {localTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {visibilityKm}km Visibility
          </span>
          {weather && (
            <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-xs font-bold capitalize">
              {weather.description}
            </span>
          )}
        </div>
      </div>
      {weather && (
        <div className="flex items-center gap-6 lg:gap-8 bg-[var(--hover-bg)] p-4 lg:p-6 rounded-3xl border border-[var(--card-border)]">
          <div className="text-right">
            <p className="text-5xl lg:text-6xl font-black tracking-tighter">
              {Math.round(weather.temp)}°
              <span className="text-xl lg:text-2xl font-light text-[var(--text-muted)] uppercase">c</span>
            </p>
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              Feels like {Math.round(weather.feels_like)}°
            </p>
          </div>
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center">
            <WeatherIcon main={weather.main} description={weather.description} size={48} />
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/CityHeader.tsx
git commit -m "feat: add CityHeader component with city info and temperature display"
```

---

### Task 3: Create WeeklyForecast Component

**Files:**
- Create: `src/components/WeeklyForecast.tsx`

**Step 1: Create WeeklyForecast component**

7-day forecast displayed as individual day cards in a grid. Today/first day gets a gradient from primary to accent.

```tsx
// src/components/WeeklyForecast.tsx
"use client";

import { CalendarDays } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";
import { WeatherIcon } from "./WeatherIcon";

interface DayData {
  day: string;
  temp_max: number;
  temp_min: number;
  main: string;
  description: string;
}

export function WeeklyForecast() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[280px] text-[var(--text-muted)]">
        Select a city to view forecast
      </div>
    );
  }

  const days: DayData[] = forecast
    ? Object.values(
        forecast.reduce(
          (acc, entry) => {
            const day = new Date(entry.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
            });
            if (!acc[day]) {
              acc[day] = {
                day,
                temp_max: entry.temp_max,
                temp_min: entry.temp_min,
                main: entry.main,
                description: entry.description,
              };
            } else {
              acc[day].temp_max = Math.max(acc[day].temp_max, entry.temp_max);
              acc[day].temp_min = Math.min(acc[day].temp_min, entry.temp_min);
            }
            return acc;
          },
          {} as Record<string, DayData>
        )
      ).slice(0, 7)
    : [];

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8 px-2">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg lg:text-xl font-bold">Weekly Forecast</h3>
        </div>
      </div>
      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 lg:gap-4">
          {days.map((d, i) => (
            <div
              key={d.day}
              className={`flex flex-col items-center p-3 lg:p-5 rounded-[2rem] transition-all ${
                i === 0
                  ? "bg-gradient-to-b from-[var(--primary)] to-[var(--accent)] text-white shadow-xl shadow-[var(--primary)]/20 scale-105"
                  : "hover:bg-[var(--hover-bg)] border border-transparent hover:border-[var(--card-border)]"
              }`}
            >
              <span
                className={`text-xs font-bold mb-3 uppercase tracking-wider ${
                  i === 0 ? "opacity-80" : "text-[var(--text-muted)]"
                }`}
              >
                {d.day}
              </span>
              <div className="mb-3 lg:mb-4">
                <WeatherIcon main={d.main} description={d.description} size={28} />
              </div>
              <span className={`text-lg lg:text-xl font-black ${i === 0 ? "" : ""}`}>
                {Math.round(d.temp_max)}°
              </span>
              <span
                className={`text-xs mt-1 ${
                  i === 0 ? "opacity-70" : "text-[var(--text-muted)]"
                }`}
              >
                {Math.round(d.temp_min)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/WeeklyForecast.tsx
git commit -m "feat: add WeeklyForecast component with 7-day card grid"
```

---

### Task 4: Create WindCompass Component

**Files:**
- Create: `src/components/WindCompass.tsx`

**Step 1: Create WindCompass component**

Displays wind speed, direction compass with gradient needle, and descriptive tags. Uses existing `wind_speed` and `wind_deg` from CurrentWeather.

```tsx
// src/components/WindCompass.tsx
"use client";

import { Wind } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useDashboard } from "@/context/DashboardContext";

function getWindDirection(deg: number): string {
  const dirs = ["North", "North East", "East", "South East", "South", "South West", "West", "North West"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx];
}

function getWindArrow(deg: number): string {
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  const idx = Math.round(deg / 45) % 8;
  return arrows[idx];
}

function getWindTag(speed: number): string {
  if (speed < 3) return "Calm";
  if (speed < 8) return "Gentle";
  if (speed < 14) return "Moderate";
  if (speed < 20) return "Strong";
  return "Very Strong";
}

export function WindCompass() {
  const { selectedCity } = useDashboard();
  const { data: weather, isLoading } = useWeather(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[280px] text-[var(--text-muted)]">
        Select a city to view wind data
      </div>
    );
  }

  const windDeg = weather?.wind_deg ?? 0;
  const windSpeed = weather?.wind_speed ?? 0;

  return (
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <Wind className="w-5 h-5 text-[var(--text-muted)]" />
        <h3 className="text-lg lg:text-xl font-bold">Wind Metrics</h3>
      </div>

      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black">
                {Math.round(windSpeed)}
              </span>
              <span className="text-lg lg:text-xl font-semibold text-[var(--text-muted)] uppercase">
                m/s
              </span>
            </div>
            <span className="text-base lg:text-lg text-[var(--text-secondary)] font-bold mt-2">
              {getWindDirection(windDeg)}{" "}
              <span className="text-[var(--primary)] text-2xl ml-2">
                {getWindArrow(windDeg)}
              </span>
            </span>
            <div className="mt-6 lg:mt-8 flex gap-3">
              <div className="px-4 py-2 bg-[var(--hover-bg)] rounded-2xl text-xs font-bold border border-[var(--card-border)]">
                {getWindTag(windSpeed)}
              </div>
            </div>
          </div>
          <div className="relative w-28 h-28 lg:w-36 lg:h-36 border-4 border-[var(--card-border)] rounded-full flex items-center justify-center">
            <span className="absolute top-2 text-[10px] font-black text-[var(--text-muted)]">N</span>
            <span className="absolute right-2 text-[10px] font-black text-[var(--text-muted)]">E</span>
            <span className="absolute bottom-2 text-[10px] font-black text-[var(--text-muted)]">S</span>
            <span className="absolute left-2 text-[10px] font-black text-[var(--text-muted)]">W</span>
            <div
              className="w-1.5 h-16 lg:h-20 rounded-full relative"
              style={{
                background: `linear-gradient(to top, var(--primary), var(--accent))`,
                transform: `rotate(${windDeg}deg)`,
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
              }}
            >
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "14px solid var(--accent)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/WindCompass.tsx
git commit -m "feat: add WindCompass component with direction needle and speed display"
```

---

### Task 5: Restyle AQIGauge to Large SVG Gauge

**Files:**
- Modify: `src/components/AQIGauge.tsx` (full rewrite)
- Modify: `src/components/AirQualityPanel.tsx` (lines 54-79)

**Step 1: Rewrite AQIGauge with large SVG circular gauge**

```tsx
// src/components/AQIGauge.tsx
"use client";

const AQI_LEVELS = [
  { max: 1, label: "Optimal", color: "#22c55e", bg: "bg-green-500/10" },
  { max: 2, label: "Fair", color: "#eab308", bg: "bg-yellow-500/10" },
  { max: 3, label: "Moderate", color: "#f97316", bg: "bg-orange-500/10" },
  { max: 4, label: "Poor", color: "#ef4444", bg: "bg-red-500/10" },
  { max: 5, label: "Very Poor", color: "#7c3aed", bg: "bg-purple-500/10" },
];

interface AQIGaugeProps {
  aqi: number;
}

export function AQIGauge({ aqi }: AQIGaugeProps) {
  const level = AQI_LEVELS[Math.min(aqi - 1, 4)];
  // SVG circle: circumference = 2 * PI * r = 2 * 3.14159 * 80 ≈ 502
  const circumference = 502;
  const progress = ((6 - aqi) / 5) * circumference; // higher AQI = less fill
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%" cy="50%" r="80"
            fill="transparent"
            stroke="var(--card-border)"
            strokeWidth="12"
            className="opacity-50"
          />
          <circle
            cx="50%" cy="50%" r="80"
            fill="transparent"
            stroke={level.color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl lg:text-5xl font-black">{aqi}</span>
          <span
            className={`text-xs font-bold uppercase tracking-widest ${level.bg} px-3 py-1 rounded-full mt-2`}
            style={{ color: level.color }}
          >
            {level.label}
          </span>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update AirQualityPanel styling**

Replace the panel wrapper classes. Change `glass-card p-4 sm:p-5` to `glass-card p-6 lg:p-8` and update the header icon from `Wind` to use `Wind` with new spacing. Also add a descriptive text below the gauge.

```tsx
// src/components/AirQualityPanel.tsx
"use client";

import { Wind } from "lucide-react";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useDashboard } from "@/context/DashboardContext";
import { AQIGauge } from "./AQIGauge";

interface PollutantBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
}

function PollutantBar({ label, value, max, unit }: PollutantBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)]">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, #22c55e ${0}%, #eab308 ${(50 / pct) * 100}%, #ef4444 ${(100 / pct) * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}

export function AirQualityPanel() {
  const { selectedCity } = useDashboard();
  const { data: airQuality, isLoading } = useAirQuality(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-8 flex items-center justify-center h-[300px] text-[var(--text-muted)]">
        Select a city to view air quality
      </div>
    );
  }

  return (
    <div className="glass-card p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full flex items-center gap-3 mb-6 lg:mb-8">
        <Wind className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg lg:text-xl font-bold">Air Quality</h3>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : airQuality ? (
        <>
          <AQIGauge aqi={airQuality.aqi} />
          <p className="text-center text-sm text-[var(--text-muted)] mt-6 lg:mt-8 font-medium">
            PM2.5: {airQuality.components.pm2_5.toFixed(1)} µg/m³
          </p>
          <div className="w-full space-y-3 mt-4">
            <PollutantBar label="PM2.5" value={airQuality.components.pm2_5} max={75} unit="µg/m³" />
            <PollutantBar label="PM10" value={airQuality.components.pm10} max={150} unit="µg/m³" />
            <PollutantBar label="O₃" value={airQuality.components.o3} max={180} unit="µg/m³" />
            <PollutantBar label="NO₂" value={airQuality.components.no2} max={200} unit="µg/m³" />
          </div>
        </>
      ) : (
        <p className="text-[var(--text-muted)] text-sm">No air quality data available</p>
      )}
    </div>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/AQIGauge.tsx src/components/AirQualityPanel.tsx
git commit -m "feat: redesign AQI gauge to large SVG circular display with Optimal badge"
```

---

### Task 6: Restyle HourlyChart

**Files:**
- Modify: `src/components/HourlyChart.tsx` (lines 65-103)

**Step 1: Update HourlyChart card styling**

Change the wrapper to use new glass-card padding and update the header:

In `src/components/HourlyChart.tsx`, replace lines 65-71:
```tsx
// Old:
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[var(--accent-blue)]" />
        <h2 className="font-semibold">Next 24 Hours</h2>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{selectedCity.name}</span>
      </div>

// New:
    <div className="glass-card p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg lg:text-xl font-bold">Hourly Forecast</h3>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Next 24h</span>
      </div>
```

Also change the ResponsiveContainer height from `220` to `240`, and update the bar radius from `[6, 6, 0, 0]` to `[10, 10, 0, 0]`.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/HourlyChart.tsx
git commit -m "feat: restyle HourlyChart with glass morphism and updated header"
```

---

### Task 7: Restyle ForecastChart

**Files:**
- Modify: `src/components/ForecastChart.tsx` (lines 89-95)

**Step 1: Update ForecastChart card styling**

In `src/components/ForecastChart.tsx`, replace lines 89-95:
```tsx
// Old:
    <div className="glass-card p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-[var(--accent-blue)]" />
        <h2 className="font-semibold">5-Day Forecast</h2>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{selectedCity.name}</span>
      </div>

// New:
    <div className="glass-card p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg lg:text-xl font-bold">Temperature Trend</h3>
        </div>
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">5-Day</span>
      </div>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ForecastChart.tsx
git commit -m "feat: restyle ForecastChart with glass morphism header"
```

---

### Task 8: Restyle CityCard for Glass Overlay

**Files:**
- Modify: `src/components/CityCard.tsx` (lines 26-36, add new props)
- Modify: `src/components/CityCardsRow.tsx` (full restyle)

**Step 1: Update CityCard for map overlay style**

In `src/components/CityCard.tsx`, update the outer div className (lines 27-36). The card should use glass morphism and show as an overlay card. Selected card gets primary border and scale.

Replace lines 26-36:
```tsx
// Old:
    <div
      onClick={() => selectCity(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") selectCity(city); }}
      className={`glass-card p-4 min-w-[170px] sm:min-w-[200px] text-left transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
        isSelected
          ? "ring-2 ring-[var(--accent-blue)]/50 border-[var(--accent-blue)]/30"
          : ""
      }`}
    >

// New:
    <div
      onClick={() => selectCity(city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") selectCity(city); }}
      className={`glass p-4 lg:p-6 min-w-[240px] sm:min-w-[280px] rounded-3xl text-left transition-all duration-300 cursor-pointer snap-center ${
        isSelected
          ? "border-2 border-[var(--primary)]/50 scale-105 shadow-[var(--primary)]/10"
          : "opacity-80 hover:opacity-100 hover:border-[var(--primary)]/30"
      }`}
    >
```

Also add a "Live Tracking" badge for the selected card. After line 40 (inside the first inner div), add:

```tsx
      <div className="flex items-start justify-between mb-3">
        <div>
          {isSelected && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
              Live Tracking
            </span>
          )}
          <h3 className="font-bold text-base lg:text-lg leading-tight">{city.name}</h3>
```

**Step 2: Update CityCardsRow to support snap scrolling**

In `src/components/CityCardsRow.tsx`, update line 30:
```tsx
// Old:
    <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pt-1 pb-2 mb-0 px-1">

// New:
    <div ref={scrollRef} className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-6 px-8 lg:px-12 snap-x">
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/CityCard.tsx src/components/CityCardsRow.tsx
git commit -m "feat: restyle CityCard and CityCardsRow with glass overlay design"
```

---

### Task 9: Restyle TemperatureRanking

**Files:**
- Modify: `src/components/TemperatureRanking.tsx` (lines 126, 132-152)

**Step 1: Update TemperatureRanking wrapper and pills**

In `src/components/TemperatureRanking.tsx`, update line 126:
```tsx
// Old:
    <div className="glass-card p-4 sm:p-5 h-full flex flex-col">

// New:
    <div className="glass-card p-6 lg:p-8 h-full flex flex-col">
```

Update lines 132-135 header:
```tsx
// Old:
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="font-semibold">Temperature Ranking</h2>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{filtered.length} cities</span>
      </div>

// New:
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg lg:text-xl font-bold">Temperature Ranking</h3>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{filtered.length} cities</span>
      </div>
```

Update zone pill classes (lines 144-148):
```tsx
// Old:
            className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
              zone === z.key
                ? "bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] border border-[var(--accent-blue)]/50"
                : "bg-[var(--hover-bg)] text-[var(--text-secondary)] border border-transparent hover-row"
            }`}

// New:
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition-all duration-200 border ${
              zone === z.key
                ? "bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/50"
                : "bg-[var(--hover-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover-row"
            }`}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/TemperatureRanking.tsx
git commit -m "feat: restyle TemperatureRanking with glass morphism and larger pills"
```

---

### Task 10: Restyle WeatherMap for Hero Section

**Files:**
- Modify: `src/components/WeatherMap.tsx` (lines 79-101)

**Step 1: Remove card wrapper from WeatherMap**

The map will now be used as a full-width hero, so we strip the card wrapper. The glass-card header and wrapper are handled by DashboardLayout.

In `src/components/WeatherMap.tsx`, replace the return statement (lines 79-101):

```tsx
// New return:
  return (
    <div className="relative h-full w-full overflow-hidden">
      {allCities.map((city) => (
        <CityMarkerData
          key={`${city.lat}-${city.lon}`}
          city={city}
          onData={handleMarkerData}
        />
      ))}

      <LeafletMap
        center={center}
        selectToken={selectToken}
        markers={Array.from(markers.values())}
        onMarkerClick={handleMarkerClick}
      />
    </div>
  );
```

**Step 2: Update LeafletMap container style**

In `src/components/LeafletMap.tsx`, ensure the MapContainer fills full height. Line 92 style is already `{ height: "100%", width: "100%" }` — no change needed.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/WeatherMap.tsx
git commit -m "feat: strip card wrapper from WeatherMap for hero section usage"
```

---

### Task 11: Redesign DashboardLayout (Main Assembly)

**Files:**
- Modify: `src/components/DashboardLayout.tsx` (full rewrite)

**Step 1: Rewrite DashboardLayout with new structure**

This is the main assembly that wires everything together: fixed glass navbar, map hero with city cards overlay, content section with rounded overlap.

```tsx
// src/components/DashboardLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
  const { addCity } = useDashboard();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="fixed bottom-10 right-10 w-16 h-16 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
        style={{
          background: `linear-gradient(135deg, var(--primary), var(--accent))`,
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
        <div className="fixed bottom-28 right-10 z-[100] w-72">
          <CitySearch />
        </div>
      )}
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Glass Navbar */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center px-6 lg:px-8 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--card-border)]">
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
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-transparent">
            WeatherDash
          </h1>
        </div>

        {/* Search - desktop */}
        <div className="hidden md:block flex-1 max-w-xl">
          <CitySearch />
        </div>

        <div className="flex items-center gap-4 lg:gap-6 ml-auto">
          <ThemeToggle />
          <div className="h-10 w-10 rounded-2xl p-0.5" style={{ background: `linear-gradient(135deg, var(--primary), var(--accent))` }}>
            <div className="w-full h-full rounded-[14px] bg-[var(--content-bg)] flex items-center justify-center">
              <span className="text-xs font-bold bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                WD
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="md:hidden fixed top-20 left-0 right-0 z-[90] px-4 py-3 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--card-border)]">
        <CitySearch />
      </div>

      {/* Main content */}
      <main className="pt-20">
        {/* Map Hero Section */}
        <section className="relative h-[50vh] lg:h-[65vh] w-full bg-[var(--background)] overflow-hidden">
          <WeatherMap />

          {/* City Cards Overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <CityCardsRow />
          </div>
        </section>

        {/* Content Section - overlapping map */}
        <div
          className="relative z-30 -mt-4 rounded-t-[2rem] lg:rounded-t-[3rem] p-6 lg:p-12"
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
              <div className="col-span-12 lg:col-span-8">
                <WeeklyForecast />
              </div>

              {/* Air Quality - 4 cols */}
              <div className="col-span-12 lg:col-span-4">
                <AirQualityPanel />
              </div>

              {/* Hourly Chart - 6 cols */}
              <div className="col-span-12 lg:col-span-6">
                <HourlyChart />
              </div>

              {/* Wind Compass - 6 cols */}
              <div className="col-span-12 lg:col-span-6">
                <WindCompass />
              </div>

              {/* 5-Day Forecast Chart - 12 cols */}
              <div className="col-span-12">
                <ForecastChart />
              </div>

              {/* Temperature Ranking - 12 cols */}
              <div className="col-span-12">
                <TemperatureRanking />
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 lg:mt-20 mb-8 lg:mb-12 flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-[var(--card-border)]">
              <p className="text-[var(--text-muted)] text-sm font-medium">
                Data refreshed automatically every 5 minutes
              </p>
              <div className="flex gap-6 lg:gap-8 text-sm font-bold text-[var(--text-muted)]">
                <span className="hover:text-[var(--primary)] transition-colors cursor-pointer">API: Open-Meteo</span>
              </div>
            </footer>
          </div>
        </div>
      </main>

      <FABButton />
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Start dev server and verify visually**

Run: `npm run dev`
Expected: Dashboard loads with new layout — glass navbar, map hero, city cards overlay, content section below

**Step 4: Commit**

```bash
git add src/components/DashboardLayout.tsx
git commit -m "feat: redesign DashboardLayout with glass navbar, map hero, and content overlap"
```

---

### Task 12: Dark Theme Content Background Fix

**Files:**
- Modify: `src/app/globals.css` (--content-bg variable)

**Step 1: Verify dark mode content section**

The `--content-bg` variable needs to render correctly in both themes. Check the content section background in dark mode. The light value is `#ffffff` and dark is `#0f172a` (slate-900).

If the dark mode content section looks wrong, adjust the `--content-bg` in `.dark` to match `var(--background)` or a slightly lighter shade.

**Step 2: Verify both themes visually**

Run dev server, toggle between light and dark mode, check:
- Navbar glass effect is visible in both themes
- Map loads correctly
- City cards are readable over the map
- Content section background contrasts with map
- All cards have visible glass effect
- Text is readable (contrast 4.5:1+)
- Transitions are smooth (300ms)

**Step 3: Fix any issues found**

Adjust CSS variables as needed.

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: verify and polish dark theme content background"
```

---

### Task 13: Remove Unused CityImageCard Import

**Files:**
- Modify: `src/components/DashboardLayout.tsx` (verify CityImageCard is not imported)

**Step 1: Verify CityImageCard is no longer imported**

The new DashboardLayout from Task 11 does not import CityImageCard. Verify the file `src/components/CityImageCard.tsx` still exists (keep it — do not delete existing components) but is no longer used in the layout.

**Step 2: Final build verification**

Run: `npm run build`
Expected: Build succeeds with no errors, no unused import warnings

**Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "feat: complete futuristic glass weather dashboard redesign"
```

---

## Execution Order & Dependencies

```
Task 1 (tokens) ──→ Task 2 (CityHeader) ──→ Task 11 (assembly)
                ──→ Task 3 (WeeklyForecast) ──→ Task 11
                ──→ Task 4 (WindCompass) ──→ Task 11
                ──→ Task 5 (AQI restyle) ──→ Task 11
                ──→ Task 6 (HourlyChart) ──→ Task 11
                ──→ Task 7 (ForecastChart) ──→ Task 11
                ──→ Task 8 (CityCard restyle) ──→ Task 11
                ──→ Task 9 (Ranking restyle) ──→ Task 11
                ──→ Task 10 (WeatherMap hero) ──→ Task 11
Task 11 ──→ Task 12 (dark theme fix) ──→ Task 13 (cleanup)
```

Tasks 2-10 can be parallelized (they are independent). Task 11 depends on all of them. Tasks 12-13 are sequential after 11.
