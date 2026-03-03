"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getWeatherIconSvg } from "./WeatherIcon";

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function createWeatherIcon(main: string, temp: number) {
  const { svg, color } = getWeatherIconSvg(main);
  return L.divIcon({
    className: "",
    html: `<div style="
      display: flex; align-items: center; gap: 6px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 5px 10px;
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4), 0 0 20px ${color}15;
    ">${svg}<span style="color:${color}">${Math.round(temp)}°</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [45, 18],
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
  markers: CityMarker[];
}

export default function LeafletMap({ center, markers }: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <MapUpdater center={center} />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {markers.map((m) =>
        m.temp !== undefined && m.main ? (
          <Marker
            key={`${m.lat}-${m.lon}`}
            position={[m.lat, m.lon]}
            icon={createWeatherIcon(m.main, m.temp)}
          >
            <Popup>
              <div style={{ color: "#1e293b", fontWeight: 600 }}>
                {m.name}: {Math.round(m.temp)}°C
                <br />
                <span style={{ fontWeight: 400, fontSize: 12 }}>{m.description}</span>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
