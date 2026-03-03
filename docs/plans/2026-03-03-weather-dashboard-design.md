# Weather Dashboard Design

**Date:** 2026-03-03
**Status:** Approved

## Overview

A real-time weather dashboard web app that displays weather conditions for user-configurable cities. Built with Next.js, React, and Tailwind CSS with a dark glassmorphism UI.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Map:** React Leaflet + Leaflet
- **Data Fetching:** @tanstack/react-query (5-min polling)
- **Weather API:** OpenWeatherMap (free tier, 1000 calls/day)

## Architecture

Single-page dashboard with client-side polling every 5 minutes.

### API Routes (server-side, keeps API key secure)

- `GET /api/weather?lat=X&lon=Y` — Current conditions
- `GET /api/forecast?lat=X&lon=Y` — 5-day / 3-hour forecast
- `GET /api/air-quality?lat=X&lon=Y` — Air pollution + UV index
- `GET /api/geocode?q=cityname` — City search autocomplete

### Data Flow

1. User adds a city via search bar (Geocoding API resolves name to coords)
2. React Query fetches current weather, forecast, and air quality in parallel
3. Data cached server-side (5-min TTL) and client-side (React Query)
4. Polling refreshes every 5 minutes
5. Selected cities persisted in localStorage

## Dashboard Layout

### Header
- App title "WeatherPulse" with Lucide cloud icon
- City search bar with autocomplete dropdown
- Add button to add city to dashboard

### City Cards Row
- Horizontally scrollable row of glassmorphism cards
- Each card shows: city name, temperature, weather icon, humidity, wind speed, feels-like
- Click a card to select it and populate detail panels below
- Remove button (X) on each card

### Detail Panels (2x2 grid below city cards)

1. **5-Day Forecast** — Recharts line chart with high/low temperatures, precipitation probability
2. **Weather Map** — React Leaflet with OpenWeatherMap tile overlays (temperature, precipitation, clouds layer toggles)
3. **Air Quality** — AQI gauge (color-coded), UV index, pollutant breakdown (PM2.5, PM10, O3, NO2)
4. **Hourly Breakdown** — Bar chart of temperatures for the next 24 hours

## Visual Design

- **Theme:** Dark mode
- **Background:** `#0f172a` (slate-900)
- **Cards:** Glassmorphism — `backdrop-blur-xl`, `bg-white/5`, `border border-white/10`
- **Accent colors:** Temperature-based gradients (blue for cold, orange for warm)
- **Typography:** System font stack via Tailwind
- **Icons:** Lucide React throughout
- **Animations:** Smooth transitions on hover, card selection, data refresh

## File Structure

```
weather-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── globals.css         # Tailwind + custom styles
│   │   └── api/
│   │       ├── weather/route.ts
│   │       ├── forecast/route.ts
│   │       ├── air-quality/route.ts
│   │       └── geocode/route.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CitySearch.tsx
│   │   ├── CityCard.tsx
│   │   ├── CityCardsRow.tsx
│   │   ├── ForecastChart.tsx
│   │   ├── WeatherMap.tsx
│   │   ├── AirQualityPanel.tsx
│   │   ├── HourlyChart.tsx
│   │   └── AQIGauge.tsx
│   ├── hooks/
│   │   ├── useWeather.ts
│   │   ├── useForecast.ts
│   │   ├── useAirQuality.ts
│   │   └── useCities.ts
│   ├── lib/
│   │   ├── weather-api.ts      # OpenWeatherMap API helpers
│   │   ├── cache.ts            # Server-side cache
│   │   └── types.ts            # TypeScript types
│   └── context/
│       └── DashboardContext.tsx # Selected city + cities state
├── public/
├── docs/plans/
├── .env.local                  # OPENWEATHERMAP_API_KEY
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Environment Variables

```
OPENWEATHERMAP_API_KEY=your_key_here
```

## Rate Limiting Considerations

OpenWeatherMap free tier: 1000 calls/day.
- With 5-min polling and 3 API endpoints per city:
- 5 cities = 15 calls per refresh = 4,320 calls/day (exceeds limit)
- **Mitigation:** Server-side cache ensures identical requests within 5 minutes share one API call. Typical usage with cache: ~864 calls/day (well within limits).
