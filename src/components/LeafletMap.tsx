"use client";

import { useEffect, useRef, useMemo, memo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { getWeatherIconSvg } from "./WeatherIcon";

const TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

function MapUpdater({ center, selectToken }: { center: [number, number]; selectToken: number }) {
  const map = useMap();
  useEffect(() => {
    const zoom = Math.max(map.getZoom(), 4);
    const targetPoint = map.project(center, zoom);
    const mapHeight = map.getSize().y;
    targetPoint.y += mapHeight * 0.15;
    const offsetCenter = map.unproject(targetPoint, zoom);
    map.flyTo(offsetCenter, zoom, { duration: 0.8 });
  }, [center, selectToken, map]);
  return null;
}

function getTempColor(temp: number): string {
  if (temp <= 0) return "#2563eb";
  if (temp <= 10) return "#3b82f6";
  if (temp <= 20) return "#22d3ee";
  if (temp <= 30) return "#fb923c";
  return "#ef4444";
}

// Icon cache to avoid recreating identical divIcons
const iconCache = new Map<string, L.DivIcon>();

function getWeatherIcon(main: string, temp: number, isDark: boolean, isSelected: boolean): L.DivIcon {
  const roundedTemp = Math.round(temp);
  const cacheKey = `${main}-${roundedTemp}-${isDark}-${isSelected}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  const { svg, color } = getWeatherIconSvg(main);
  const bg = isSelected
    ? (isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)")
    : isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const shadow = isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)";
  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const tempColor = isSelected ? getTempColor(roundedTemp) : color;
  const scale = isSelected ? "scale(1.3)" : "scale(1)";
  const boxShadow = isSelected
    ? `0 4px 20px ${shadow}`
    : `0 2px 8px ${shadow}`;

  const icon = L.divIcon({
    className: "",
    html: `<div style="
      display: inline-flex; align-items: center; gap: 5px;
      background: ${bg};
      border: 1px solid ${border};
      border-radius: 8px;
      padding: ${isSelected ? "6px 10px" : "4px 8px"};
      color: ${textColor};
      font-size: ${isSelected ? "14px" : "12px"};
      font-weight: ${isSelected ? "700" : "600"};
      white-space: nowrap;
      box-shadow: ${boxShadow};
      transform: translate(-50%, -50%) ${scale};
      z-index: ${isSelected ? "1000" : "1"};
    ">${svg}<span style="color:${tempColor}">${roundedTemp}°</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

export interface CityMarker {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  temp?: number;
  main?: string;
  description?: string;
}

interface LeafletMapProps {
  center: [number, number];
  selectToken: number;
  markers: CityMarker[];
  selectedCoords?: { lat: number; lon: number } | null;
  onMarkerClick?: (marker: CityMarker) => void;
}

/** Swaps the tile layer and container background when the theme changes. */
function ThemeTileLayer() {
  const { theme } = useTheme();
  const map = useMap();
  const url = theme === "dark" ? TILES.dark : TILES.light;

  useEffect(() => {
    const container = map.getContainer();
    container.style.background = theme === "dark" ? "#020617" : "#f8fafc";
    map.invalidateSize();
  }, [theme, map]);

  return <TileLayer key={theme} url={url} attribution="" keepBuffer={6} updateWhenZooming={false} />;
}

/** Individual marker — memoized to skip re-renders when props haven't changed */
const MapMarker = memo(function MapMarker({
  marker,
  isDark,
  isSelected,
  onClick,
}: {
  marker: CityMarker;
  isDark: boolean;
  isSelected: boolean;
  onClick?: () => void;
}) {
  if (marker.temp === undefined || !marker.main) return null;

  return (
    <Marker
      position={[marker.lat, marker.lon]}
      icon={getWeatherIcon(marker.main, marker.temp, isDark, isSelected)}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={onClick ? { click: onClick } : undefined}
    />
  );
});

export default function LeafletMap({ center, selectToken, markers, selectedCoords, onMarkerClick }: LeafletMapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <MapContainer
      center={center}
      zoom={5}
      minZoom={4}
      maxBoundsViscosity={1.0}
      maxBounds={[[-85, -180], [85, 180]]}
      maxZoom={8}
      style={{ height: "100%", width: "100%", background: isDark ? "#020617" : "#f8fafc" }}
      zoomControl={false}
      preferCanvas={true}
    >
      <MapUpdater center={center} selectToken={selectToken} />
      <ThemeTileLayer />
      {markers.map((m) => (
        <MapMarker
          key={`${m.lat}-${m.lon}`}
          marker={m}
          isDark={isDark}
          isSelected={!!(selectedCoords && m.lat === selectedCoords.lat && m.lon === selectedCoords.lon)}
          onClick={onMarkerClick ? () => onMarkerClick(m) : undefined}
        />
      ))}
    </MapContainer>
  );
}
