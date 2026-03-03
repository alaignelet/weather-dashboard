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
    const results: City[] = (data.results || []).map(
      (item: { name: string; latitude: number; longitude: number; country_code: string; admin1?: string; country?: string }) => ({
        name: item.name,
        lat: item.latitude,
        lon: item.longitude,
        country: item.country_code,
        state: item.admin1,
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
