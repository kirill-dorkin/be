import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const countryCode = searchParams.get("countryCode");
    const locale = searchParams.get("locale") || "en";

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Преобразуем locale в формат языка для Nominatim (en-US -> en, ru-RU -> ru)
    const language = locale.split("-")[0];

    const nominatimParams = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: "5",
      ...(countryCode && { countrycodes: countryCode.toLowerCase() }),
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${nominatimParams.toString()}`,
      {
        headers: {
          "User-Agent": "BestElectronics/1.0",
          "Accept-Language": language,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch address suggestions" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Address autocomplete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "edge";
