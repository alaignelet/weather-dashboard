import { CloudSun } from "lucide-react";
import { CitySearch } from "./CitySearch";

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <CloudSun className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold tracking-tight">WeatherPulse</h1>
      </div>
      <CitySearch />
    </header>
  );
}
