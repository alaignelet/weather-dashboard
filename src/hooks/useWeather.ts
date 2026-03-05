"use client";

import { useQuery } from "@tanstack/react-query";
import type { CurrentWeather } from "@/lib/types";

export function useWeather(lat: number, lon: number, enabled = true) {
  return useQuery<CurrentWeather>({
    queryKey: ["weather", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      return res.json();
    },
    enabled: enabled && lat !== 0 && lon !== 0,
  });
}
