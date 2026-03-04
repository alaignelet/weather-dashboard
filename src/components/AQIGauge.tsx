"use client";

const AQI_LEVELS = [
  { max: 1, label: "Optimal", color: "#22c55e", bg: "bg-green-500/10" },
  { max: 2, label: "Fair", color: "#eab308", bg: "bg-yellow-500/10" },
  { max: 3, label: "Moderate", color: "#f97316", bg: "bg-orange-500/10" },
  { max: 4, label: "Poor", color: "#ef4444", bg: "bg-red-500/10" },
  { max: 5, label: "Very Poor", color: "#7c3aed", bg: "bg-purple-500/10" },
];

interface AQIGaugeProps {
  aqi: number;
}

export function AQIGauge({ aqi }: AQIGaugeProps) {
  const level = AQI_LEVELS[Math.min(aqi - 1, 4)];
  const circumference = 502;
  const progress = ((6 - aqi) / 5) * circumference;
  const offset = circumference - progress;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%" cy="50%" r="80"
            fill="transparent"
            stroke="var(--card-border)"
            strokeWidth="12"
            className="opacity-50"
          />
          <circle
            cx="50%" cy="50%" r="80"
            fill="transparent"
            stroke={level.color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl lg:text-5xl font-black">{aqi}</span>
          <span
            className={`text-xs font-bold uppercase tracking-widest ${level.bg} px-3 py-1 rounded-full mt-2`}
            style={{ color: level.color }}
          >
            {level.label}
          </span>
        </div>
      </div>
    </div>
  );
}
