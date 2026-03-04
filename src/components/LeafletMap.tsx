"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
    map.flyTo(center, Math.max(map.getZoom(), 5), { duration: 0.8 });
  }, [center, selectToken, map]);
  return null;
}

function createWeatherIcon(main: string, temp: number, isDark: boolean) {
  const { svg, color } = getWeatherIconSvg(main);
  const bg = isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const shadow = isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)";
  const textColor = isDark ? "#e2e8f0" : "#1e293b";

  return L.divIcon({
    className: "",
    html: `<div style="
      display: inline-flex; align-items: center; gap: 5px;
      background: ${bg};
      backdrop-filter: blur(8px);
      border: 1px solid ${border};
      border-radius: 8px;
      padding: 4px 8px;
      color: ${textColor};
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 8px ${shadow};
      transform: translate(-50%, -50%);
    ">${svg}<span style="color:${color}">${Math.round(temp)}°</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
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

export default function LeafletMap({ center, selectToken, markers, onMarkerClick }: LeafletMapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <MapContainer
      center={center}
      zoom={4}
      minZoom={5}
      maxBoundsViscosity={1.0}
      maxBounds={[[-85, -180], [85, 180]]}
      maxZoom={8}
      style={{ height: "100%", width: "100%", background: isDark ? "#020617" : "#f8fafc" }}
      zoomControl={false}
    >
      <MapUpdater center={center} selectToken={selectToken} />
      <ThemeTileLayer />
      {markers.map((m) =>
        m.temp !== undefined && m.main ? (
          <Marker
            key={`${m.lat}-${m.lon}-${isDark ? "d" : "l"}`}
            position={[m.lat, m.lon]}
            icon={createWeatherIcon(m.main, m.temp, isDark)}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m) } : undefined}
          >
            <Popup>
              <div style={{ padding: "4px 0", minWidth: 120 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>
                  {Math.round(m.temp)}°C
                </div>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>
                  {m.description}
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
