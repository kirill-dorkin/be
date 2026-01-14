import { NextResponse } from "next/server";

import type { SupportedLocale } from "@/regions/types";
import { getCurrentRegion } from "@/regions/server";
import { getSearchService } from "@/services/search";

import { getSuggestionQueriesForService } from "@/lib/repair-services/parts-suggestions";

type SelectedPart = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
};

type RequestBody =
  | { query: string; services?: never }
  | { services: { slug: string }[]; query?: string };

const MAX_RESULTS_PER_SERVICE = 6;

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 },
    );
  }

  const region = await getCurrentRegion();
  const searchService = await getSearchService();
  const locale = region.language.locale as SupportedLocale;
  const channel = region.market.channel;

  // Direct query mode (manual search)
  if ("query" in body) {
    const query = body.query?.trim() ?? "";
    if (query.length < 2) {
      return NextResponse.json({ ok: true, data: [], locale });
    }

    const result = await searchService.search(
      { query, limit: MAX_RESULTS_PER_SERVICE },
      { channel, languageCode: region.language.code },
    );

    if (!result.ok || !result.data.results) {
      return NextResponse.json({ ok: true, data: [], locale });
    }

    const parts = result.data.results.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price.amount,
      currency: product.price.currency,
    }));

    return NextResponse.json({ ok: true, data: parts, locale });
  }

  if (!Array.isArray(body.services)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 },
    );
  }

  const response: Record<string, SelectedPart[]> = {};

  for (const entry of body.services) {
    if (!entry?.slug) continue;

    const queries = getSuggestionQueriesForService(entry.slug);

    if (!queries.length) continue;

    const collected = new Map<string, SelectedPart>();

    for (const query of queries) {
      const result = await searchService.search(
        { query, limit: MAX_RESULTS_PER_SERVICE },
        { channel, languageCode: region.language.code },
      );

      if (!result.ok || !result.data.results) {
        continue;
      }

      for (const product of result.data.results) {
        if (collected.has(product.id)) continue;

        collected.set(product.id, {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price.amount,
          currency: product.price.currency,
        });
      }
    }

    if (collected.size > 0) {
      response[entry.slug] = Array.from(collected.values()).slice(
        0,
        MAX_RESULTS_PER_SERVICE,
      );
    }
  }

  return NextResponse.json({ ok: true, data: response, locale });
}
