import { Header } from "@/components/Header";
import { CityCardsRow } from "@/components/CityCardsRow";
import { ForecastChart } from "@/components/ForecastChart";
import { WeatherMap } from "@/components/WeatherMap";
import { AirQualityPanel } from "@/components/AirQualityPanel";
import { HourlyChart } from "@/components/HourlyChart";

export default function Home() {
  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header />
      <CityCardsRow />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart />
        <WeatherMap />
        <AirQualityPanel />
        <HourlyChart />
      </div>
    </main>
  );
}
