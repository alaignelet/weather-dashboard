"use client";

import { useQuery } from "@tanstack/react-query";

export function useCityImage(cityName: string | undefined) {
  return useQuery({
    queryKey: ["city-image", cityName],
    queryFn: async () => {
      if (!cityName) return null;
      const res = await fetch(`/api/city-image?city=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      return data.imageUrl as string | null;
    },
    enabled: !!cityName,
    staleTime: 24 * 60 * 60 * 1000, // 24h
  });
}
