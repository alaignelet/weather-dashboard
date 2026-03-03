"use client";

import { useQuery } from "@tanstack/react-query";
import type { ForecastEntry } from "@/lib/types";

export function useForecast(lat: number, lon: number) {
  return useQuery<ForecastEntry[]>({
    queryKey: ["forecast", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
  });
}
