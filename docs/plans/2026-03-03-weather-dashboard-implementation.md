# WeatherPulse Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real-time weather dashboard that displays current conditions, forecasts, air quality, and weather maps for user-configurable cities.

**Architecture:** Single-page Next.js app with API routes proxying OpenWeatherMap. Client-side polling every 5 minutes via React Query. Dark glassmorphism UI with Tailwind CSS.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, Lucide React, Recharts, React Leaflet, @tanstack/react-query, OpenWeatherMap API

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.local`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/alaignelet/Documents/08_PhD/weather-dashboard
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

When prompted about overwriting, choose yes. This scaffolds the entire Next.js project with Tailwind already configured.

**Step 2: Install dependencies**

Run:
```bash
npm install lucide-react recharts react-leaflet leaflet @tanstack/react-query
npm install -D @types/leaflet
```

**Step 3: Create `.env.local`**

Create file `.env.local`:
```
OPENWEATHERMAP_API_KEY=your_api_key_here
```

**Step 4: Set up dark theme globals**

Replace `src/app/globals.css` with:
```css
@import "tailwindcss";

:root {
  --background: #0f172a;
  --foreground: #e2e8f0;
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(255, 255, 255, 0.1);
  --accent-blue: #3b82f6;
  --accent-orange: #f97316;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
}

/* Glassmorphism card utility */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
}

/* Custom scrollbar for city cards row */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**Step 5: Set up root layout with React Query provider**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "WeatherPulse",
  description: "Real-time weather dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Create `src/app/providers.tsx`:
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardProvider } from "@/context/DashboardContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchInterval: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardProvider>{children}</DashboardProvider>
    </QueryClientProvider>
  );
}
```

**Step 6: Create placeholder page**

Replace `src/app/page.tsx` with:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">WeatherPulse</h1>
      <p className="text-slate-400 mt-2">Dashboard coming soon...</p>
    </main>
  );
}
```

**Step 7: Verify dev server runs**

Run: `npm run dev`
Expected: Server starts at localhost:3000, page renders with "WeatherPulse" heading on dark background.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, React Query, and dependencies"
```

---

## Task 2: TypeScript Types & Server-Side Cache

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/cache.ts`

**Step 1: Define TypeScript types**

Create `src/lib/types.ts`:
```ts
export interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  description: string;
  icon: string;
  main: string;
  pressure: number;
  visibility: number;
  clouds: number;
  dt: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastEntry {
  dt: number;
  temp: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  main: string;
  pop: number; // probability of precipitation
  wind_speed: number;
}

export interface AirQuality {
  aqi: number; // 1-5 scale
  components: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
}

export interface UVData {
  value: number;
}
```

**Step 2: Create server-side cache**

Create `src/lib/cache.ts`:
```ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}
```

**Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/cache.ts
git commit -m "feat: add TypeScript types and server-side cache"
```

---

## Task 3: API Routes

**Files:**
- Create: `src/lib/weather-api.ts`
- Create: `src/app/api/weather/route.ts`
- Create: `src/app/api/forecast/route.ts`
- Create: `src/app/api/air-quality/route.ts`
- Create: `src/app/api/geocode/route.ts`

**Step 1: Create OpenWeatherMap API helper**

Create `src/lib/weather-api.ts`:
```ts
const BASE_URL = "https://api.openweathermap.org";

function getApiKey(): string {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) throw new Error("OPENWEATHERMAP_API_KEY is not set");
  return key;
}

export async function fetchCurrentWeather(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export async function fetchForecast(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  return res.json();
}

export async function fetchAirQuality(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Air quality API error: ${res.status}`);
  return res.json();
}

export async function fetchGeocode(query: string) {
  const res = await fetch(
    `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Geocode API error: ${res.status}`);
  return res.json();
}
```

**Step 2: Create weather API route**

Create `src/app/api/weather/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const cacheKey = `weather:${lat}:${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchCurrentWeather(Number(lat), Number(lon));
    const result = {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      pressure: data.main.pressure,
      visibility: data.visibility,
      clouds: data.clouds.all,
      dt: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
```

**Step 3: Create forecast API route**

Create `src/app/api/forecast/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { fetchForecast } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";
import type { ForecastEntry } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const cacheKey = `forecast:${lat}:${lon}`;
  const cached = getCached<ForecastEntry[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchForecast(Number(lat), Number(lon));
    const result: ForecastEntry[] = data.list.map((entry: Record<string, unknown>) => ({
      dt: entry.dt,
      temp: (entry.main as Record<string, number>).temp,
      temp_min: (entry.main as Record<string, number>).temp_min,
      temp_max: (entry.main as Record<string, number>).temp_max,
      humidity: (entry.main as Record<string, number>).humidity,
      description: ((entry.weather as Record<string, string>[])[0]).description,
      icon: ((entry.weather as Record<string, string>[])[0]).icon,
      main: ((entry.weather as Record<string, string>[])[0]).main,
      pop: entry.pop,
      wind_speed: (entry.wind as Record<string, number>).speed,
    }));
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch forecast data" },
      { status: 500 }
    );
  }
}
```

**Step 4: Create air quality API route**

Create `src/app/api/air-quality/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAirQuality } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";
import type { AirQuality } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const cacheKey = `air:${lat}:${lon}`;
  const cached = getCached<AirQuality>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchAirQuality(Number(lat), Number(lon));
    const item = data.list[0];
    const result: AirQuality = {
      aqi: item.main.aqi,
      components: {
        pm2_5: item.components.pm2_5,
        pm10: item.components.pm10,
        o3: item.components.o3,
        no2: item.components.no2,
        so2: item.components.so2,
        co: item.components.co,
      },
    };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch air quality data" },
      { status: 500 }
    );
  }
}
```

**Step 5: Create geocode API route**

Create `src/app/api/geocode/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { fetchGeocode } from "@/lib/weather-api";
import type { City } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const data = await fetchGeocode(q);
    const results: City[] = data.map(
      (item: { name: string; lat: number; lon: number; country: string; state?: string }) => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state,
      })
    );
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to geocode" },
      { status: 500 }
    );
  }
}
```

**Step 6: Verify API routes work**

Run: `npm run dev`
Then in another terminal: `curl "http://localhost:3000/api/geocode?q=Paris"`
Expected: JSON array of city results (requires valid API key in `.env.local`).

**Step 7: Commit**

```bash
git add src/lib/weather-api.ts src/app/api/
git commit -m "feat: add API routes for weather, forecast, air quality, and geocode"
```

---

## Task 4: Dashboard Context & Custom Hooks

**Files:**
- Create: `src/context/DashboardContext.tsx`
- Create: `src/hooks/useCities.ts`
- Create: `src/hooks/useWeather.ts`
- Create: `src/hooks/useForecast.ts`
- Create: `src/hooks/useAirQuality.ts`

**Step 1: Create Dashboard Context**

Create `src/context/DashboardContext.tsx`:
```tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { City } from "@/lib/types";

interface DashboardState {
  cities: City[];
  selectedCity: City | null;
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
  const [hydrated, setHydrated] = useState(false);

  // Load cities from localStorage on mount
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

  // Persist cities to localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    }
  }, [cities, hydrated]);

  // Auto-select first city
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0]);
    }
  }, [cities, selectedCity]);

  const addCity = (city: City) => {
    const exists = cities.some((c) => c.lat === city.lat && c.lon === city.lon);
    if (!exists) {
      setCities((prev) => [...prev, city]);
      setSelectedCity(city);
    }
  };

  const removeCity = (city: City) => {
    setCities((prev) => prev.filter((c) => !(c.lat === city.lat && c.lon === city.lon)));
    if (selectedCity?.lat === city.lat && selectedCity?.lon === city.lon) {
      setSelectedCity(cities.length > 1 ? cities[0] : null);
    }
  };

  const selectCity = (city: City) => setSelectedCity(city);

  return (
    <DashboardContext.Provider value={{ cities, selectedCity, addCity, removeCity, selectCity }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
```

**Step 2: Create data-fetching hooks**

Create `src/hooks/useWeather.ts`:
```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { CurrentWeather } from "@/lib/types";

export function useWeather(lat: number, lon: number) {
  return useQuery<CurrentWeather>({
    queryKey: ["weather", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    },
  });
}
```

Create `src/hooks/useForecast.ts`:
```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { ForecastEntry } from "@/lib/types";

export function useForecast(lat: number, lon: number) {
  return useQuery<ForecastEntry[]>({
    queryKey: ["forecast", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
  });
}
```

Create `src/hooks/useAirQuality.ts`:
```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { AirQuality } from "@/lib/types";

export function useAirQuality(lat: number, lon: number) {
  return useQuery<AirQuality>({
    queryKey: ["air-quality", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch air quality");
      return res.json();
    },
  });
}
```

Create `src/hooks/useCities.ts`:
```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { City } from "@/lib/types";

export function useCitySearch(query: string) {
  return useQuery<City[]>({
    queryKey: ["geocode", query],
    queryFn: async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to search cities");
      return res.json();
    },
    enabled: query.length >= 2,
  });
}
```

**Step 3: Commit**

```bash
git add src/context/ src/hooks/
git commit -m "feat: add dashboard context and data-fetching hooks"
```

---

## Task 5: Header & City Search Component

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/CitySearch.tsx`

**Step 1: Create CitySearch component**

Create `src/components/CitySearch.tsx`:
```tsx
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

  // Close dropdown on outside click
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
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search city..."
          className="bg-transparent outline-none text-sm text-slate-200 placeholder-slate-500 w-48"
        />
        {query && (
          <button onClick={() => { setQuery(""); setIsOpen(false); }}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </button>
        )}
      </div>

      {isOpen && results && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass-card p-2 z-50">
          {results.map((city, i) => (
            <button
              key={`${city.lat}-${city.lon}-${i}`}
              onClick={() => handleSelect(city)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              <span>
                {city.name}
                {city.state ? `, ${city.state}` : ""}, {city.country}
              </span>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create Header component**

Create `src/components/Header.tsx`:
```tsx
import { CloudSun } from "lucide-react";
import { CitySearch } from "./CitySearch";

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <CloudSun className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold tracking-tight">WeatherPulse</h1>
      </div>
      <CitySearch />
    </header>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/Header.tsx src/components/CitySearch.tsx
git commit -m "feat: add Header and CitySearch components"
```

---

## Task 6: City Cards Row

**Files:**
- Create: `src/components/CityCard.tsx`
- Create: `src/components/CityCardsRow.tsx`

**Step 1: Create CityCard component**

Create `src/components/CityCard.tsx`:
```tsx
"use client";

import { X, Droplets, Wind, Thermometer } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useDashboard } from "@/context/DashboardContext";
import type { City } from "@/lib/types";

function getTempColor(temp: number): string {
  if (temp <= 0) return "from-blue-600 to-blue-400";
  if (temp <= 10) return "from-blue-500 to-cyan-400";
  if (temp <= 20) return "from-cyan-400 to-green-400";
  if (temp <= 30) return "from-yellow-400 to-orange-400";
  return "from-orange-500 to-red-500";
}

interface CityCardProps {
  city: City;
}

export function CityCard({ city }: CityCardProps) {
  const { data: weather, isLoading } = useWeather(city.lat, city.lon);
  const { selectedCity, selectCity, removeCity } = useDashboard();
  const isSelected = selectedCity?.lat === city.lat && selectedCity?.lon === city.lon;

  return (
    <button
      onClick={() => selectCity(city)}
      className={`glass-card p-4 min-w-[200px] text-left transition-all duration-300 hover:bg-white/10 ${
        isSelected ? "ring-2 ring-blue-400/50 bg-white/10" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{city.name}</h3>
          <p className="text-xs text-slate-400">{city.country}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCity(city);
          }}
          className="text-slate-500 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-white/10 rounded w-20" />
          <div className="h-4 bg-white/10 rounded w-32" />
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="w-12 h-12"
            />
            <span
              className={`text-3xl font-bold bg-gradient-to-r ${getTempColor(weather.temp)} bg-clip-text text-transparent`}
            >
              {Math.round(weather.temp)}°
            </span>
          </div>
          <p className="text-xs text-slate-300 capitalize mb-3">{weather.description}</p>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3" />
              {Math.round(weather.feels_like)}°
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {weather.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {weather.wind_speed}m/s
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-500">No data</p>
      )}
    </button>
  );
}
```

**Step 2: Create CityCardsRow component**

Create `src/components/CityCardsRow.tsx`:
```tsx
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
    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-6">
      {cities.map((city) => (
        <CityCard key={`${city.lat}-${city.lon}`} city={city} />
      ))}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/CityCard.tsx src/components/CityCardsRow.tsx
git commit -m "feat: add CityCard and CityCardsRow components"
```

---

## Task 7: Forecast Chart

**Files:**
- Create: `src/components/ForecastChart.tsx`

**Step 1: Create ForecastChart component**

Create `src/components/ForecastChart.tsx`:
```tsx
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import { CalendarDays } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";

export function ForecastChart() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-slate-500">
        Select a city to view forecast
      </div>
    );
  }

  // Group by day and get daily min/max
  const dailyData = forecast
    ? Object.values(
        forecast.reduce(
          (acc, entry) => {
            const date = new Date(entry.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            if (!acc[date]) {
              acc[date] = {
                date,
                temp_max: entry.temp_max,
                temp_min: entry.temp_min,
                pop: entry.pop,
              };
            } else {
              acc[date].temp_max = Math.max(acc[date].temp_max, entry.temp_max);
              acc[date].temp_min = Math.min(acc[date].temp_min, entry.temp_min);
              acc[date].pop = Math.max(acc[date].pop, entry.pop);
            }
            return acc;
          },
          {} as Record<
            string,
            { date: string; temp_max: number; temp_min: number; pop: number }
          >
        )
      ).slice(0, 5)
    : [];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">5-Day Forecast</h2>
        <span className="text-xs text-slate-400 ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${Math.round(v)}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#e2e8f0",
              }}
              formatter={(value: number, name: string) => [
                `${Math.round(value)}°C`,
                name === "temp_max" ? "High" : name === "temp_min" ? "Low" : "Precip",
              ]}
            />
            <Line
              type="monotone"
              dataKey="temp_max"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: "#f97316", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="temp_min"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="pop"
              fill="rgba(59,130,246,0.1)"
              stroke="none"
              yAxisId={0}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ForecastChart.tsx
git commit -m "feat: add 5-day forecast chart component"
```

---

## Task 8: Weather Map

**Files:**
- Create: `src/components/WeatherMap.tsx`

**Step 1: Create WeatherMap component**

Create `src/components/WeatherMap.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { Map as MapIcon, Layers } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), {
  ssr: false,
}) as unknown;

type LayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

const LAYERS: { id: LayerType; label: string }[] = [
  { id: "temp_new", label: "Temperature" },
  { id: "precipitation_new", label: "Precipitation" },
  { id: "clouds_new", label: "Clouds" },
  { id: "wind_new", label: "Wind" },
];

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  // We need to use useMap inside the map - import it properly
  const { useMap: useMapHook } = require("react-leaflet");
  const map = useMapHook();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

export function WeatherMap() {
  const { selectedCity, cities } = useDashboard();
  const [activeLayer, setActiveLayer] = useState<LayerType>("temp_new");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Import leaflet CSS
    import("leaflet/dist/leaflet.css");
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="glass-card p-6 h-[300px] flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const center = selectedCity
    ? { lat: selectedCity.lat, lng: selectedCity.lon }
    : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Weather Map</h2>
        <div className="flex gap-1 ml-auto">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                activeLayer === layer.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden h-[240px]">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution=""
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            url={`https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`}
            opacity={0.6}
          />
        </MapContainer>
      </div>
    </div>
  );
}
```

**Important note:** The map tile layer needs a **public** API key. Add to `.env.local`:
```
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
```

**Step 2: Commit**

```bash
git add src/components/WeatherMap.tsx
git commit -m "feat: add interactive weather map with layer toggles"
```

---

## Task 9: Air Quality Panel

**Files:**
- Create: `src/components/AirQualityPanel.tsx`
- Create: `src/components/AQIGauge.tsx`

**Step 1: Create AQI Gauge component**

Create `src/components/AQIGauge.tsx`:
```tsx
"use client";

const AQI_LEVELS = [
  { max: 1, label: "Good", color: "#22c55e", bg: "bg-green-500/20" },
  { max: 2, label: "Fair", color: "#eab308", bg: "bg-yellow-500/20" },
  { max: 3, label: "Moderate", color: "#f97316", bg: "bg-orange-500/20" },
  { max: 4, label: "Poor", color: "#ef4444", bg: "bg-red-500/20" },
  { max: 5, label: "Very Poor", color: "#7c3aed", bg: "bg-purple-500/20" },
];

interface AQIGaugeProps {
  aqi: number;
}

export function AQIGauge({ aqi }: AQIGaugeProps) {
  const level = AQI_LEVELS[Math.min(aqi - 1, 4)];

  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${level.bg}`}
        style={{ border: `3px solid ${level.color}` }}
      >
        <span className="text-xl font-bold" style={{ color: level.color }}>
          {aqi}
        </span>
      </div>
      <div>
        <p className="font-semibold" style={{ color: level.color }}>
          {level.label}
        </p>
        <p className="text-xs text-slate-400">Air Quality Index</p>
      </div>
    </div>
  );
}
```

**Step 2: Create AirQualityPanel component**

Create `src/components/AirQualityPanel.tsx`:
```tsx
"use client";

import { Wind, Sun } from "lucide-react";
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
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
          style={{ width: `${pct}%` }}
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
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-slate-500">
        Select a city to view air quality
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Air Quality</h2>
        <span className="text-xs text-slate-400 ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : airQuality ? (
        <div className="space-y-4">
          <AQIGauge aqi={airQuality.aqi} />
          <div className="space-y-3 mt-4">
            <PollutantBar label="PM2.5" value={airQuality.components.pm2_5} max={75} unit="µg/m³" />
            <PollutantBar label="PM10" value={airQuality.components.pm10} max={150} unit="µg/m³" />
            <PollutantBar label="O₃" value={airQuality.components.o3} max={180} unit="µg/m³" />
            <PollutantBar label="NO₂" value={airQuality.components.no2} max={200} unit="µg/m³" />
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No air quality data available</p>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/AQIGauge.tsx src/components/AirQualityPanel.tsx
git commit -m "feat: add air quality panel with AQI gauge and pollutant bars"
```

---

## Task 10: Hourly Chart

**Files:**
- Create: `src/components/HourlyChart.tsx`

**Step 1: Create HourlyChart component**

Create `src/components/HourlyChart.tsx`:
```tsx
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Clock } from "lucide-react";
import { useForecast } from "@/hooks/useForecast";
import { useDashboard } from "@/context/DashboardContext";

function getTempBarColor(temp: number): string {
  if (temp <= 0) return "#3b82f6";
  if (temp <= 10) return "#06b6d4";
  if (temp <= 20) return "#22c55e";
  if (temp <= 30) return "#f97316";
  return "#ef4444";
}

export function HourlyChart() {
  const { selectedCity } = useDashboard();
  const { data: forecast, isLoading } = useForecast(
    selectedCity?.lat ?? 0,
    selectedCity?.lon ?? 0
  );

  if (!selectedCity) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-[300px] text-slate-500">
        Select a city to view hourly data
      </div>
    );
  }

  // Take next 8 entries (24 hours at 3-hour intervals)
  const hourlyData = forecast
    ? forecast.slice(0, 8).map((entry) => ({
        time: new Date(entry.dt * 1000).toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }),
        temp: Math.round(entry.temp),
      }))
    : [];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Next 24 Hours</h2>
        <span className="text-xs text-slate-400 ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                color: "#e2e8f0",
              }}
              formatter={(value: number) => [`${value}°C`, "Temperature"]}
            />
            <Bar dataKey="temp" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry, index) => (
                <Cell key={index} fill={getTempBarColor(entry.temp)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/HourlyChart.tsx
git commit -m "feat: add hourly temperature bar chart"
```

---

## Task 11: Assemble Dashboard Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Wire up all components in the main page**

Replace `src/app/page.tsx` with:
```tsx
import { Header } from "@/components/Header";
import { CityCardsRow } from "@/components/CityCardsRow";
import { ForecastChart } from "@/components/ForecastChart";
import { WeatherMap } from "@/components/WeatherMap";
import { AirQualityPanel } from "@/components/AirQualityPanel";
import { HourlyChart } from "@/components/HourlyChart";

export default function Home() {
  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header />
      <CityCardsRow />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart />
        <WeatherMap />
        <AirQualityPanel />
        <HourlyChart />
      </div>
    </main>
  );
}
```

**Step 2: Verify full dashboard renders**

Run: `npm run dev`
Open: `http://localhost:3000`
Expected: Full dashboard with header, city cards for Paris/NYC/Tokyo, and four detail panels.

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble full dashboard page with all components"
```

---

## Task 12: Fix WeatherMap SSR & Leaflet Integration

The WeatherMap component from Task 8 has SSR issues with Leaflet. This task cleans it up.

**Files:**
- Modify: `src/components/WeatherMap.tsx`

**Step 1: Rewrite WeatherMap with proper dynamic imports**

Replace `src/components/WeatherMap.tsx` with:
```tsx
"use client";

import { useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import dynamic from "next/dynamic";

type LayerType = "temp_new" | "precipitation_new" | "clouds_new" | "wind_new";

const LAYERS: { id: LayerType; label: string }[] = [
  { id: "temp_new", label: "Temp" },
  { id: "precipitation_new", label: "Rain" },
  { id: "clouds_new", label: "Clouds" },
  { id: "wind_new", label: "Wind" },
];

// Dynamically import the entire map to avoid SSR issues
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
    </div>
  ),
});

export function WeatherMap() {
  const { selectedCity } = useDashboard();
  const [activeLayer, setActiveLayer] = useState<LayerType>("temp_new");

  const center: [number, number] = selectedCity
    ? [selectedCity.lat, selectedCity.lon]
    : [48.8566, 2.3522];

  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold">Weather Map</h2>
        <div className="flex gap-1 ml-auto">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                activeLayer === layer.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden h-[240px]">
        <LeafletMap center={center} activeLayer={activeLayer} />
      </div>
    </div>
  );
}
```

**Step 2: Create LeafletMap client component**

Create `src/components/LeafletMap.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LeafletMapProps {
  center: [number, number];
  activeLayer: string;
}

export default function LeafletMap({ center, activeLayer }: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <MapUpdater center={center} />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <TileLayer
        url={`https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`}
        opacity={0.6}
      />
    </MapContainer>
  );
}
```

**Step 3: Verify map renders without SSR errors**

Run: `npm run dev`
Expected: Map renders with dark tiles and weather overlay, no hydration errors.

**Step 4: Commit**

```bash
git add src/components/WeatherMap.tsx src/components/LeafletMap.tsx
git commit -m "fix: refactor WeatherMap with proper Leaflet dynamic imports"
```

---

## Task 13: Final Polish & Build Verification

**Files:**
- Modify: various components for responsive tweaks

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 2: Fix any build errors**

Address TypeScript or build errors if any arise.

**Step 3: Run production server and verify**

Run: `npm start`
Open: `http://localhost:3000`
Expected: Dashboard fully functional — city search, cards, charts, map, air quality all work.

**Step 4: Final commit and push**

```bash
git add -A
git commit -m "chore: final polish and build verification"
git push origin main
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Project scaffolding | package.json, layout, globals, providers |
| 2 | Types & cache | types.ts, cache.ts |
| 3 | API routes | 4 route handlers + weather-api helper |
| 4 | Context & hooks | DashboardContext + 4 hooks |
| 5 | Header & search | Header.tsx, CitySearch.tsx |
| 6 | City cards | CityCard.tsx, CityCardsRow.tsx |
| 7 | Forecast chart | ForecastChart.tsx |
| 8 | Weather map | WeatherMap.tsx (initial) |
| 9 | Air quality | AirQualityPanel.tsx, AQIGauge.tsx |
| 10 | Hourly chart | HourlyChart.tsx |
| 11 | Assemble page | page.tsx |
| 12 | Fix map SSR | WeatherMap.tsx, LeafletMap.tsx |
| 13 | Build & polish | Final verification |
