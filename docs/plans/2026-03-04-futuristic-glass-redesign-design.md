# Futuristic Glass Weather Dashboard - Design Document

**Date**: 2026-03-04
**Status**: Approved
**Source**: Stitch AI Screen 3 (project 2891378924740659342)

## Overview

Redesign the weather dashboard to a futuristic glass morphism aesthetic based on Stitch AI mockups. The layout shifts from a flat grid to a map-centric, vertically flowing design. All existing components are kept and restyled. No backend or data flow changes.

## Design Tokens

| Token | Value (Light) | Value (Dark) |
|-------|---------------|--------------|
| Font | Plus Jakarta Sans | Plus Jakarta Sans |
| Primary | #3b82f6 | #3b82f6 |
| Accent | #6366f1 | #6366f1 |
| Background | #f8fafc | #020617 |
| Card BG | backdrop-blur-xl bg-white/40 | backdrop-blur-xl bg-slate-900/40 |
| Card Border | border-white/20 | border-slate-700/30 |
| Card Shadow | shadow-2xl | shadow-2xl |
| Card Radius | 2.5rem | 2.5rem |
| Card Padding | p-8 | p-8 |
| Grid Gap | gap-8 | gap-8 |
| Nav Height | h-20 | h-20 |
| Map Height | 65vh | 65vh |

## Layout Structure

```
Fixed Glass Navbar (h-20, backdrop-blur-xl)
├── Logo icon box (rounded-xl, bg-primary, shadow-lg)
├── "WeatherDash" gradient text
├── Search bar (rounded-2xl, glass-like)
├── Theme toggle (sun/moon with rotation animation)
└── User avatar (gradient border from-primary to-accent)

Map Hero Section (65vh)
├── Leaflet Map (existing, full-width)
├── Pulse dots on city locations (glowing, animated)
├── Zoom/locate controls (glass buttons, right side)
└── City Cards (bottom, horizontal scroll, glass, snap-x)
    ├── Selected: border-primary/50, scale-105, "Live Tracking" badge
    └── Others: opacity-80, hover:opacity-100

Content Section (rounded-t-[3rem], -mt-4, z-30, shadow-[0_-20px_50px])
├── City Header Row
│   ├── Location icon + City name (text-4xl font-extrabold)
│   ├── Local time + Visibility + Condition badge (pill)
│   └── Temperature (text-6xl font-black) + weather icon in bg box
├── Main Grid (12 cols, gap-8)
│   ├── Weekly Forecast (8 cols, rounded-[2.5rem])
│   │   └── 7 day cards, selected: gradient from-primary to-accent
│   ├── Air Quality (4 cols, rounded-[2.5rem])
│   │   └── Larger SVG gauge (w-48 h-48), "Optimal" badge
│   ├── Hourly/Precipitation (6 cols, rounded-[2.5rem])
│   │   └── Bar chart with gradient opacity bars
│   ├── Wind Compass (6 cols, rounded-[2.5rem])
│   │   └── Direction compass + speed + tags
│   ├── Forecast Chart (12 cols, rounded-[2.5rem])
│   │   └── Existing Recharts, restyled
│   └── Temperature Ranking (12 cols, rounded-[2.5rem])
│       └── Existing table, glass restyled
└── Footer + FAB ("Track New City", fixed bottom-right)
```

## Component Changes

### 1. Header (DashboardLayout header)
- Fixed position, glass effect (bg-white/10 dark:bg-slate-950/10 backdrop-blur-xl)
- Logo: icon in rounded-xl primary box + gradient text
- Search: rounded-2xl, focus ring primary/40
- Theme toggle: sun/moon icons with rotation on hover
- CitySearch integrated into header

### 2. Map (WeatherMap/LeafletMap)
- Promoted from grid panel to 65vh hero section
- Full-width, no card wrapper
- Pulse dots replace markers (CSS animated, glowing)
- Glass zoom/locate controls on right side

### 3. CityCards (CityCardsRow + CityCard)
- Overlaid at bottom of map section
- Glass morphism (backdrop-blur-xl bg-white/40)
- Selected card: border-2 border-primary/50, scale-105, "Live Tracking" badge
- Others: opacity-80, hover:opacity-100, hover:border-primary/30
- Show: city name, temperature, humidity, UV index (2x2 grid)
- Snap-x scrolling

### 4. CityImageCard
- Removed as standalone component
- City image function absorbed by map hero

### 5. Weekly Forecast (NEW, replaces part of ForecastChart)
- 7 day cards in a grid (grid-cols-7)
- Each card: day name, weather icon, high/low temp
- Today/selected: gradient from-primary to-accent, white text, shadow-xl
- Others: hover:bg-white dark:hover:bg-slate-800

### 6. ForecastChart (existing)
- Keep Recharts implementation
- Restyle card wrapper with glass morphism
- Update colors to use new primary/accent tokens
- Rounded-[2.5rem] wrapper

### 7. HourlyChart (existing, restyled)
- Transform visual to precipitation-style bar chart
- Gradient opacity bars (primary/20 to primary full)
- Rounded-xl bars
- Larger height (h-40)
- Time labels: uppercase tracking-widest

### 8. AirQualityPanel (existing, restyled)
- Larger gauge: w-48 h-48 (from w-32 h-32)
- stroke-linecap="round" on progress arc
- "Optimal" badge below number (bg-emerald-500/10 pill)
- Larger card padding

### 9. Wind Compass (NEW component)
- Uses existing wind_speed and wind_direction from weather data
- Compass circle with N/E/S/W labels
- Gradient needle (from-primary to-accent) with glow shadow
- Wind speed display (text-5xl font-black)
- Direction text + arrow
- Tags: "Steady", "Cool Breeze" etc.

### 10. TemperatureRanking (existing, restyled)
- Glass morphism card wrapper
- Rounded-[2.5rem]
- Zone filter pills restyled

### 11. FAB Button (NEW)
- Fixed bottom-10 right-10
- Gradient from-primary to-accent
- Rounded-[2rem], shadow-2xl shadow-primary/40
- Hover tooltip "Track New City"
- Triggers city search

## Glass Utility Class

```css
.glass {
  backdrop-filter: blur(24px);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.dark .glass {
  background: rgba(15, 23, 42, 0.4);
  border-color: rgba(51, 65, 85, 0.3);
}
```

## Unchanged

- All API routes (/api/weather, /api/forecast, /api/air-quality, /api/geocode, /api/city-image)
- React Query hooks (useWeather, useForecast, useAirQuality, useCities, useCityImage)
- DashboardContext state management
- TypeScript types (lib/types.ts)
- City data (lib/cities.ts)
- Cache layer (lib/cache.ts)

## Stitch Reference Files

- Screen 1 (sidebar): /tmp/stitch-screen1.html
- Screen 2 (map + nav): /tmp/stitch-screen2.html
- Screen 3 (futuristic glass): /tmp/stitch-screen3.html
