import { NextRequest, NextResponse } from "next/server";
import { fetchAirQuality } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";
import type { AirQuality } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const cacheKey = `air:${lat}:${lon}`;
  const cached = getCached<AirQuality>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchAirQuality(Number(lat), Number(lon));
    const item = data.list[0];
    const result: AirQuality = {
      aqi: item.main.aqi,
      components: {
        pm2_5: item.components.pm2_5,
        pm10: item.components.pm10,
        o3: item.components.o3,
        no2: item.components.no2,
        so2: item.components.so2,
        co: item.components.co,
      },
    };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch air quality data" },
      { status: 500 }
    );
  }
}
