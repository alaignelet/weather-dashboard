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
      <div className="glass-card p-4 sm:p-5 flex items-center justify-center h-[300px] text-[var(--text-muted)]">
        Select a city to view air quality
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="w-5 h-5 text-[var(--accent-blue)]" />
        <h2 className="font-semibold">Air Quality</h2>
        <span className="text-xs text-[var(--text-muted)] ml-auto">{selectedCity.name}</span>
      </div>

      {isLoading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full" />
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
        <p className="text-[var(--text-muted)] text-sm">No air quality data available</p>
      )}
    </div>
  );
}
