import { NextRequest, NextResponse } from "next/server";
import { fetchForecast } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";
import type { ForecastEntry } from "@/lib/types";

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
    const result: ForecastEntry[] = data.list.map((entry: Record<string, unknown>) => ({
      dt: entry.dt,
      temp: (entry.main as Record<string, number>).temp,
      temp_min: (entry.main as Record<string, number>).temp_min,
      temp_max: (entry.main as Record<string, number>).temp_max,
      humidity: (entry.main as Record<string, number>).humidity,
      description: ((entry.weather as Record<string, string>[])[0]).description,
      icon: ((entry.weather as Record<string, string>[])[0]).icon,
      main: ((entry.weather as Record<string, string>[])[0]).main,
      pop: entry.pop,
      wind_speed: (entry.wind as Record<string, number>).speed,
    }));
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch forecast data" },
      { status: 500 }
    );
  }
}
