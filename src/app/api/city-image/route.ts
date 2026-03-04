import { NextRequest, NextResponse } from "next/server";

async function fetchWikipediaImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function fetchUnsplashImage(city: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  // Try progressively broader queries
  const queries = [`${city} city`, city];
  for (const query of queries) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 86400 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const url = data.results?.[0]?.urls?.regular;
      if (url) return url;
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  // Try Wikipedia first with multiple query variations
  const queries = [city, `${city} city`, `${city} (city)`];
  for (const query of queries) {
    const imageUrl = await fetchWikipediaImage(query);
    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    }
  }

  // Fallback to Unsplash
  const unsplashUrl = await fetchUnsplashImage(city);
  if (unsplashUrl) {
    return NextResponse.json({ imageUrl: unsplashUrl });
  }

  return NextResponse.json({ imageUrl: null });
}
