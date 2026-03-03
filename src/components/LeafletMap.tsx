"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getWeatherIconSvg } from "./WeatherIcon";

function MapUpdater({ center, selectToken }: { center: [number, number]; selectToken: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 5), { duration: 0.8 });
  }, [center, selectToken, map]);
  return null;
}

function createWeatherIcon(main: string, temp: number, name: string) {
  const { svg, color } = getWeatherIconSvg(main);
  return L.divIcon({
    className: "",
    html: `<div style="
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 4px 8px;
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
  temp?: number;
  main?: string;
  description?: string;
}

interface LeafletMapProps {
  center: [number, number];
  selectToken: number;
  markers: CityMarker[];
}

export default function LeafletMap({ center, selectToken, markers }: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={3}
      minZoom={3}
      maxZoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <MapUpdater center={center} selectToken={selectToken} />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {markers.map((m) =>
        m.temp !== undefined && m.main ? (
          <Marker
            key={`${m.lat}-${m.lon}`}
            position={[m.lat, m.lon]}
            icon={createWeatherIcon(m.main, m.temp, m.name)}
          >
            <Popup>
              <div style={{
                padding: "4px 0",
                minWidth: 120,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 2,
                }}>
                  {m.name}
                </div>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 2,
                }}>
                  {Math.round(m.temp)}°C
                </div>
                <div style={{
                  fontSize: 12,
                  color: "#64748b",
                  textTransform: "capitalize",
                }}>
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
