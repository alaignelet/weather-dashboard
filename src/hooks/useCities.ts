"use client";

import { useQuery } from "@tanstack/react-query";
import type { City } from "@/lib/types";

export function useCitySearch(query: string) {
  return useQuery<City[]>({
    queryKey: ["geocode", query],
    queryFn: async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to search cities");
      return res.json();
    },
    enabled: query.length >= 2,
  });
}
