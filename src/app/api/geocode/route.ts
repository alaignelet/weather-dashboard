import { NextRequest, NextResponse } from "next/server";
import { fetchGeocode } from "@/lib/weather-api";
import type { City } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const data = await fetchGeocode(q);
    const results: City[] = data.map(
      (item: { name: string; lat: number; lon: number; country: string; state?: string }) => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state,
      })
    );
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to geocode" },
      { status: 500 }
    );
  }
}
