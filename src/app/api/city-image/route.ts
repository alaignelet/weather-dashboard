import { NextRequest, NextResponse } from "next/server";

async function fetchWikipediaImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Skip disambiguation pages
    if (data.type === "disambiguation") return null;
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  if (!city) {
    return NextResponse.json({ error: "City required" }, { status: 400 });
  }

  // Try multiple query variations to find a good image
  const queries = [
    city,
    `${city} city`,
    `${city} (city)`,
  ];

  for (const query of queries) {
    const imageUrl = await fetchWikipediaImage(query);
    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    }
  }

  return NextResponse.json({ imageUrl: null });
}
