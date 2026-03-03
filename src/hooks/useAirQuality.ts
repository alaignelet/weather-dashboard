"use client";

import { useQuery } from "@tanstack/react-query";
import type { AirQuality } from "@/lib/types";

export function useAirQuality(lat: number, lon: number) {
  return useQuery<AirQuality>({
    queryKey: ["air-quality", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch air quality");
      return res.json();
    },
  });
}
