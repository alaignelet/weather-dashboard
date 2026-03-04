import { NextRequest, NextResponse } from "next/server";

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
    for (const result of results) {
      const image = await fetchWikipediaImage(result.title);
      if (image) return image;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchUnsplashImage(city: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
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

  // Try Wikipedia direct lookups with multiple query variations
  const queries = [city, `${city} city`, `${city} (city)`];
  for (const query of queries) {
    const imageUrl = await fetchWikipediaImage(query);
    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    }
  }

  // Try Wikipedia search API as fallback
  const searchImage = await fetchWikipediaSearchImage(city);
  if (searchImage) {
    return NextResponse.json({ imageUrl: searchImage });
  }

  // Fallback to Unsplash
  const unsplashUrl = await fetchUnsplashImage(city);
  if (unsplashUrl) {
    return NextResponse.json({ imageUrl: unsplashUrl });
  }

  return NextResponse.json({ imageUrl: null });
}
