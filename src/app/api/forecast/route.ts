import { NextRequest, NextResponse } from "next/server";
import { fetchForecast } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";
import type { ForecastEntry } from "@/lib/types";

function getWeatherDescription(code: number): { description: string; icon: string; main: string } {
  const map: Record<number, { description: string; icon: string; main: string }> = {
    0: { description: "clear sky", icon: "01d", main: "Clear" },
    1: { description: "mainly clear", icon: "02d", main: "Clear" },
    2: { description: "partly cloudy", icon: "03d", main: "Clouds" },
    3: { description: "overcast", icon: "04d", main: "Clouds" },
    45: { description: "foggy", icon: "50d", main: "Fog" },
    48: { description: "depositing rime fog", icon: "50d", main: "Fog" },
    51: { description: "light drizzle", icon: "09d", main: "Drizzle" },
    53: { description: "moderate drizzle", icon: "09d", main: "Drizzle" },
    55: { description: "dense drizzle", icon: "09d", main: "Drizzle" },
    61: { description: "slight rain", icon: "10d", main: "Rain" },
    63: { description: "moderate rain", icon: "10d", main: "Rain" },
    65: { description: "heavy rain", icon: "10d", main: "Rain" },
    71: { description: "slight snow", icon: "13d", main: "Snow" },
    73: { description: "moderate snow", icon: "13d", main: "Snow" },
    75: { description: "heavy snow", icon: "13d", main: "Snow" },
    80: { description: "slight rain showers", icon: "09d", main: "Rain" },
    81: { description: "moderate rain showers", icon: "09d", main: "Rain" },
    82: { description: "violent rain showers", icon: "09d", main: "Rain" },
    95: { description: "thunderstorm", icon: "11d", main: "Thunderstorm" },
    96: { description: "thunderstorm with hail", icon: "11d", main: "Thunderstorm" },
    99: { description: "thunderstorm with heavy hail", icon: "11d", main: "Thunderstorm" },
  };
  return map[code] || { description: "unknown", icon: "01d", main: "Clear" };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const cacheKey = `forecast:${lat}:${lon}`;
  const cached = getCached<ForecastEntry[]>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchForecast(Number(lat), Number(lon));
    const hourly = data.hourly;

    // Build hourly forecast entries (next 40 entries = ~5 days at 3h, but Open-Meteo gives hourly)
    const result: ForecastEntry[] = [];
    for (let i = 0; i < Math.min(hourly.time.length, 120); i++) {
      result.push({
        dt: Math.floor(new Date(hourly.time[i]).getTime() / 1000),
        temp: hourly.temperature_2m[i],
        temp_min: hourly.temperature_2m[i],
        temp_max: hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m[i],
        description: getWeatherDescription(hourly.weather_code[i]).description,
        icon: getWeatherDescription(hourly.weather_code[i]).icon,
        main: getWeatherDescription(hourly.weather_code[i]).main,
        pop: (hourly.precipitation_probability[i] || 0) / 100,
        wind_speed: Math.round(hourly.wind_speed_10m[i] * 10 / 36) / 10,
      });
    }

    // Also enrich with daily min/max for the forecast chart
    const daily = data.daily;
    if (daily) {
      for (const entry of result) {
        const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
        const dayIndex = daily.time.indexOf(entryDate);
        if (dayIndex !== -1) {
          entry.temp_min = daily.temperature_2m_min[dayIndex];
          entry.temp_max = daily.temperature_2m_max[dayIndex];
        }
      }
    }

    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch forecast data" },
      { status: 500 }
    );
  }
}
