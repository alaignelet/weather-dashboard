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
        <p className="text-xs text-[var(--text-muted)]">Air Quality Index</p>
      </div>
    </div>
  );
}
