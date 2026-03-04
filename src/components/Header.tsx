import { CloudSun } from "lucide-react";
import { CitySearch } from "./CitySearch";

export function Header() {
  return (
    <div className="flex items-center gap-6 flex-1">
      <div className="flex items-center gap-3">
        <CloudSun className="w-7 h-7 text-[var(--accent-blue)]" />
        <h1 className="text-2xl font-bold tracking-tight">WeatherPulse</h1>
      </div>
      <div className="ml-auto">
        <CitySearch />
      </div>
    </div>
  );
}
