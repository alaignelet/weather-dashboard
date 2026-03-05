import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/cache";

function isUnwantedImage(url: string): boolean {
  const lower = url.toLowerCase();
  return /flag|coat.of.arms|emblem|seal.of|escudo|blason|crest|banner|logo|shield/.test(lower);
}

async function fetchWikipediaImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    const url = data.originalimage?.source || data.thumbnail?.source || null;
    if (url && isUnwantedImage(url)) return null;
    return url;
  } catch {
    return null;
  }
}

/** Use Wikipedia's search API to find the best matching article, then get its image. */
async function fetchWikipediaSearchImage(city: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(city + " city")}&srlimit=3&format=json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.query?.search;
    if (!results?.length) return null;
    // Try all search results in parallel instead of sequentially
    const images = await Promise.all(results.map((r: { title: string }) => fetchWikipediaImage(r.title)));
    return images.find((img) => img !== null) ?? null;
  } catch {
    return null;
  }
}

async function fetchUnsplashImage(city: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city + " city")}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  // Check server-side cache (24h TTL)
  const cacheKey = `city-image:${city.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return NextResponse.json(cached);

  // Try all Wikipedia direct lookups in parallel
  const queries = [city, `${city} city`, `${city} (city)`];
  const wikiResults = await Promise.all(queries.map(fetchWikipediaImage));
  const wikiImage = wikiResults.find((img) => img !== null);
  if (wikiImage) {
    const result = { imageUrl: wikiImage };
    setCache(cacheKey, result, 86400000); // 24h
    return NextResponse.json(result);
  }

  // Try Wikipedia search API as fallback
  const searchImage = await fetchWikipediaSearchImage(city);
  if (searchImage) {
    const result = { imageUrl: searchImage };
    setCache(cacheKey, result, 86400000);
    return NextResponse.json(result);
  }

  // Fallback to Unsplash
  const unsplashUrl = await fetchUnsplashImage(city);
  const result = { imageUrl: unsplashUrl };
  setCache(cacheKey, result, 86400000);
  return NextResponse.json(result);
}
