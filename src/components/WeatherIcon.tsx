"use client";

import {
  SunIcon,
  CloudIcon,
  RainIcon,
  HeavyRainIcon,
  SnowIcon,
  ThunderIcon,
  FogIcon,
  PartlyCloudyIcon,
  WindIcon,
} from "@/components/ui/animated-weather-icons";

interface AnimatedWeatherIconProps {
  main: string;
  description?: string;
  size?: number;
  className?: string;
}

/**
 * Maps WMO weather categories to animated SVG icons.
 * Also re-exports getWeatherIconSvg for Leaflet map markers (static SVG strings).
 */
export function WeatherIcon({ main, description, size = 40, className }: AnimatedWeatherIconProps) {
  // Use description to distinguish heavy vs light rain
  const isHeavy = description?.includes("heavy") || description?.includes("violent");

  switch (main) {
    case "Clear":
      return <SunIcon size={size} className={className} />;
    case "Clouds":
      // "partly cloudy" vs full overcast
      if (description?.includes("partly") || description?.includes("mainly clear")) {
        return <PartlyCloudyIcon size={size} className={className} />;
      }
      return <CloudIcon size={size} className={className} />;
    case "Rain":
      return isHeavy
        ? <HeavyRainIcon size={size} className={className} />
        : <RainIcon size={size} className={className} />;
    case "Drizzle":
      return <RainIcon size={size} className={className} />;
    case "Snow":
      return <SnowIcon size={size} className={className} />;
    case "Thunderstorm":
      return <ThunderIcon size={size} className={className} />;
    case "Fog":
      return <FogIcon size={size} className={className} />;
    default:
      return <PartlyCloudyIcon size={size} className={className} />;
  }
}

// Static SVG strings for Leaflet map markers (can't use React components in divIcon)
export function getWeatherIconSvg(main: string): { svg: string; color: string } {
  const icons: Record<string, { svg: string; color: string }> = {
    Clear: {
      color: "#fbbf24",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    },
    Clouds: {
      color: "#94a3b8",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
    },
    Rain: {
      color: "#60a5fa",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
    },
    Drizzle: {
      color: "#7dd3fc",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>`,
    },
    Snow: {
      color: "#bfdbfe",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>`,
    },
    Thunderstorm: {
      color: "#fde047",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fde047" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
    },
    Fog: {
      color: "#94a3b8",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`,
    },
  };

  return icons[main] || {
    color: "#fcd34d",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7"/><path d="M16 18H9"/><path d="M17.5 14H9"/></svg>`,
  };
}
