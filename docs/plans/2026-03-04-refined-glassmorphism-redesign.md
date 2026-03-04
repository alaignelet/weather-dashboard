# WeatherPulse Refined Glassmorphism Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full UI redesign pass — fix light mode bugs, establish design tokens, polish glassmorphism, improve typography/spacing/responsiveness/accessibility.

**Architecture:** CSS variable overhaul in globals.css, then systematic component updates replacing all hardcoded colors with theme-aware tokens. No structural changes to data flow or hooks.

**Tech Stack:** Next.js 16 / React 19 / Tailwind CSS 4 / Recharts / Framer Motion / Lucide icons

---

### Task 1: Design Tokens — globals.css overhaul

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace CSS variables with expanded design token system**

Replace the full contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

/* Light theme */
:root {
  --background: #f0f4f8;
  --foreground: #0f172a;
  --card-bg: rgba(255, 255, 255, 0.75);
  --card-border: rgba(0, 0, 0, 0.08);
  --card-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  --card-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.5);
  --accent-blue: #3b82f6;
  --accent-orange: #ea580c;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --tooltip-bg: rgba(255, 255, 255, 0.95);
  --tooltip-text: #1e293b;
  --tooltip-border: rgba(0, 0, 0, 0.1);
  --hover-bg: rgba(0, 0, 0, 0.04);
}

/* Dark theme */
.dark {
  --background: #0c1220;
  --foreground: #f1f5f9;
  --card-bg: rgba(255, 255, 255, 0.06);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  --card-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --accent-blue: #60a5fa;
  --accent-orange: #fb923c;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --tooltip-bg: rgba(15, 23, 42, 0.95);
  --tooltip-text: #e2e8f0;
  --tooltip-border: rgba(255, 255, 255, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.06);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  transition: background 0.3s ease, color 0.3s ease;
}

/* Glassmorphism card utility */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  box-shadow: var(--card-shadow), var(--card-highlight);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
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

**Step 2: Add Inter font to layout.tsx**

In `src/app/layout.tsx`, add the Google font import:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 3: Verify the app still renders**

Run: `cd /Users/alaignelet/Documents/08_PhD/weather-dashboard && npm run dev`
Expected: App loads without errors, new background color visible, Inter font applied.

**Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: overhaul design tokens, add Inter font, fix light/dark theme variables"
```

---

### Task 2: Fix DashboardLayout — spacing, responsiveness, icon color

**Files:**
- Modify: `src/components/DashboardLayout.tsx`

**Step 1: Update DashboardLayout**

Replace `DashboardLayout.tsx` with these changes:
- Line 28: ThemeToggle — add `aria-label` attribute
- Line 43: CloudSun icon — replace `text-blue-400` with `text-[var(--accent-blue)]`
- Line 44: h1 — change to `text-xl font-semibold`
- Line 59: Remove empty spacer div `<div className="hidden sm:block mb-8" />`
- Line 61: Add responsive gap: `gap-4 sm:gap-6`
- Line 65: Make image height responsive: `h-[180px] sm:h-[220px]`
- Line 69: Add responsive gap: `gap-4 sm:gap-6`
- Line 39: Add consistent top spacing: `p-4 sm:p-6 pt-6 sm:pt-8`
- Add `mt-6 sm:mt-8` between header row and city cards grid

Full replacement for the DashboardLayout function:

```tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CloudSun className="w-7 h-7 text-[var(--accent-blue)] flex-shrink-0" />
            <h1 className="text-xl font-semibold tracking-tight whitespace-nowrap">WeatherPulse</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CitySearch />
            </div>
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile search */}
        <div className="sm:hidden mb-4">
          <CitySearch />
        </div>

        {/* City cards + image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <CityCardsRow />
          </div>
          <div className="h-[180px] sm:h-[220px]">
            <CityImageCard />
          </div>
        </div>

        {/* Main panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <ForecastChart />
          <WeatherMap />
          <AirQualityPanel />
          <HourlyChart />
        </div>

        {/* Ranking */}
        <TemperatureRanking />
      </main>
    </div>
  );
}
```

Also update ThemeToggle to add `aria-label`:

```tsx
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
```

**Step 2: Verify**

Run: `npm run dev` — check layout renders, spacing is even, no empty spacer.

**Step 3: Commit**

```bash
git add src/components/DashboardLayout.tsx
git commit -m "fix: improve layout spacing, responsiveness, use CSS variables for accent colors"
```

---

### Task 3: Fix CityCard — hardcoded colors, selected state, responsiveness

**Files:**
- Modify: `src/components/CityCard.tsx`

**Step 1: Fix all hardcoded colors and improve selected state**

Changes:
- Line 32: Change `min-w-[200px]` to `min-w-[170px] sm:min-w-[200px]`
- Lines 33-35: Replace `!border-2 !border-blue-400/70` with `ring-2 ring-[var(--accent-blue)]/50` (smoother selection)
- Line 48: Replace `text-slate-500 hover:text-slate-200` with `text-[var(--text-muted)] hover:text-[var(--text-primary)]`
- Line 56: Replace `bg-white/10` with `bg-[var(--hover-bg)]` (2 occurrences in skeleton)
- Line 64: Change `text-3xl` to `text-2xl sm:text-3xl`
- Line 86: Replace `text-slate-500` with `text-[var(--text-muted)]`
- Add hover elevation effect: `hover:-translate-y-0.5 hover:shadow-lg`

Full updated component return:

```tsx
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
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm leading-tight">{city.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">{city.country}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeCity(city);
          }}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={`Remove ${city.name}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-[var(--hover-bg)] rounded w-20" />
          <div className="h-4 bg-[var(--hover-bg)] rounded w-32" />
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <WeatherIcon main={weather.main} description={weather.description} size={40} />
            <span
              className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${getTempColor(weather.temp)} bg-clip-text text-transparent`}
            >
              {Math.round(weather.temp)}°
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] capitalize mb-3">{weather.description}</p>
          <div className="flex gap-3 text-xs text-[var(--text-muted)]">
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
        <p className="text-xs text-[var(--text-muted)]">No data</p>
      )}
    </div>
```

**Step 2: Verify**

Check in both light and dark mode that:
- Close button is visible in both themes
- Selected ring animates smoothly
- Cards have subtle hover lift

**Step 3: Commit**

```bash
git add src/components/CityCard.tsx
git commit -m "fix: replace hardcoded slate colors in CityCard, add hover elevation, responsive sizing"
```

---

### Task 4: Fix Chart Tooltips — ForecastChart + HourlyChart

**Files:**
- Modify: `src/components/ForecastChart.tsx`
- Modify: `src/components/HourlyChart.tsx`

**Step 1: Fix ForecastChart tooltip and icon color**

In `src/components/ForecastChart.tsx`, replace the CustomTooltip inline styles (lines 20-38) with CSS variables:

```tsx
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const high = payload.find((p) => p.dataKey === "temp_max");
  const low = payload.find((p) => p.dataKey === "temp_min");
  return (
    <div style={{
      background: "var(--tooltip-bg)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: 12,
      padding: "8px 12px",
      color: "var(--tooltip-text)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {high && (
        <div style={{ fontSize: 13, color: "var(--accent-orange)", fontWeight: 600 }}>
          High: {Math.round(high.value)}°C
        </div>
      )}
      {low && (
        <div style={{ fontSize: 13, color: "var(--accent-blue)", fontWeight: 600 }}>
          Low: {Math.round(low.value)}°C
        </div>
      )}
    </div>
  );
}
```

Also on line 91: Replace `text-blue-400` with `text-[var(--accent-blue)]`.
On line 89: Change `p-6` to `p-4 sm:p-5`.

**Step 2: Fix HourlyChart tooltip and icon color**

In `src/components/HourlyChart.tsx`, replace CustomTooltip (lines 27-37):

```tsx
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--tooltip-bg)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--tooltip-border)",
      borderRadius: 12,
      padding: "8px 12px",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--tooltip-text)" }}>{payload[0].value}°C</div>
    </div>
  );
}
```

Also on line 68: Replace `text-blue-400` with `text-[var(--accent-blue)]`.
On line 66: Change `p-6` to `p-4 sm:p-5`.
On line 78: Change fixed `height={220}` to `height={200}` and wrap in a responsive container.
On line 96: Change `fillOpacity={0.85}` to `fillOpacity={0.9}`.

**Step 3: Verify**

Toggle between light/dark mode — tooltips should be readable in both.

**Step 4: Commit**

```bash
git add src/components/ForecastChart.tsx src/components/HourlyChart.tsx
git commit -m "fix: use CSS variables for chart tooltips, fix light mode visibility"
```

---

### Task 5: Fix AirQualityPanel + AQIGauge — hardcoded colors

**Files:**
- Modify: `src/components/AirQualityPanel.tsx`
- Modify: `src/components/AQIGauge.tsx`

**Step 1: Fix AirQualityPanel**

Replace all hardcoded slate colors:
- Line 20: `text-slate-400` → `text-[var(--text-secondary)]`
- Line 21: `text-slate-300` → `text-[var(--text-primary)]`
- Line 47: `text-slate-500` → `text-[var(--text-muted)]`
- Line 56: `text-blue-400` → `text-[var(--accent-blue)]`
- Line 58: `text-slate-400` → `text-[var(--text-muted)]`
- Line 76: `text-slate-500` → `text-[var(--text-muted)]`
- Line 54: `p-6` → `p-4 sm:p-5`
- Line 51: `p-6` → `p-4 sm:p-5`

**Step 2: Fix AQIGauge**

Line 32: Replace `text-slate-400` with `text-[var(--text-muted)]`.

**Step 3: Verify**

Check pollutant labels and AQI "Air Quality Index" text visible in light mode.

**Step 4: Commit**

```bash
git add src/components/AirQualityPanel.tsx src/components/AQIGauge.tsx
git commit -m "fix: replace hardcoded slate colors in AirQuality components for light mode"
```

---

### Task 6: Fix CitySearch — hardcoded colors, dropdown max-height

**Files:**
- Modify: `src/components/CitySearch.tsx`

**Step 1: Fix hardcoded colors and add dropdown constraints**

Changes:
- Line 35: `text-slate-400` → `text-[var(--text-muted)]`
- Line 45: Add responsive width `w-full sm:w-48`
- Line 49: `text-slate-400 hover:text-slate-200` → `text-[var(--text-muted)] hover:text-[var(--text-primary)]`
- Line 55: Add `max-h-[240px] overflow-y-auto` to dropdown
- Line 60: `hover:bg-white/10` → `hover:bg-[var(--hover-bg)]`
- Line 66: `text-slate-400` → `text-[var(--text-muted)]`
- Add `aria-label` to the clear button (line 48)

**Step 2: Commit**

```bash
git add src/components/CitySearch.tsx
git commit -m "fix: replace hardcoded colors in CitySearch, add dropdown scroll limit"
```

---

### Task 7: Fix TemperatureRanking — transition, colors

**Files:**
- Modify: `src/components/TemperatureRanking.tsx`

**Step 1: Add transition to CityRow and fix minor styling**

In CityRow (line 70): Add `transition-all duration-150` to the className.

- Line 126: `p-6` → `p-4 sm:p-5`
- Line 71: The `hover-row` class already has transition in CSS, just verify the `border-transparent` has a transition too by changing to:

```tsx
className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-150 ${
  isSelected ? "bg-blue-500/15 border-[var(--accent-blue)]/40" : "border-transparent hover-row"
}`}
```

- Line 52 skeleton: Replace `bg-white/10` with `bg-[var(--hover-bg)]` (2 occurrences)
- Line 147: Zone pill inactive `bg-white/5` → `bg-[var(--hover-bg)]`

**Step 2: Commit**

```bash
git add src/components/TemperatureRanking.tsx
git commit -m "fix: add row hover transition, replace hardcoded colors in TemperatureRanking"
```

---

### Task 8: Polish CityImageCard and CityCardsRow

**Files:**
- Modify: `src/components/CityImageCard.tsx`
- Modify: `src/components/CityCardsRow.tsx`

**Step 1: CityImageCard — fix loading spinner color**

- Line 29: Replace `border-blue-400` with `border-[var(--accent-blue)]`
- Line 26: Add `rounded-2xl` (already has glass-card which has border-radius, but ensure consistency)

**Step 2: CityCardsRow — minor spacing**

- Line 30: Change `mb-6` to `mb-0` (parent grid handles spacing now)

**Step 3: Commit**

```bash
git add src/components/CityImageCard.tsx src/components/CityCardsRow.tsx
git commit -m "fix: polish CityImageCard spinner, adjust CityCardsRow spacing"
```

---

### Task 9: Verify all panels in both themes

**Step 1: Run full verification**

Run: `npm run dev`

Manually check at `localhost:3000`:
- [ ] Toggle light → dark → light: all transitions smooth
- [ ] Chart tooltips readable in both themes
- [ ] AQI pollutant labels visible in light mode
- [ ] City cards: close button visible, hover lift works, selection ring animates
- [ ] Search: dropdown visible, icons correct color in both themes
- [ ] Temperature ranking: row hover has transition, zone pills styled correctly
- [ ] No hardcoded `text-slate-*` remaining in any component
- [ ] Inter font loaded and applied

**Step 2: Run a final grep for remaining hardcoded slate colors**

Run: `grep -rn "text-slate" src/components/`
Expected: No results (all replaced with CSS variables)

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final polish pass on all components"
```
