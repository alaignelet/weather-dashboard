import { NextRequest, NextResponse } from "next/server";
import { fetchAirQuality } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";
import type { AirQuality } from "@/lib/types";

// Convert European AQI (0-100+) to 1-5 scale
function mapEuropeanAqiTo5Scale(eaqi: number): number {
  if (eaqi <= 20) return 1; // Good
  if (eaqi <= 40) return 2; // Fair
  if (eaqi <= 60) return 3; // Moderate
  if (eaqi <= 80) return 4; // Poor
  return 5; // Very Poor
}

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
    const current = data.current;
    const result: AirQuality = {
      aqi: mapEuropeanAqiTo5Scale(current.european_aqi),
      components: {
        pm2_5: current.pm2_5,
        pm10: current.pm10,
        o3: current.ozone,
        no2: current.nitrogen_dioxide,
        so2: current.sulphur_dioxide,
        co: current.carbon_monoxide,
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
