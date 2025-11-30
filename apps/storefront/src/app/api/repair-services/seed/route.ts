import { NextResponse } from "next/server";

import { repairServiceCatalog } from "@/lib/repair-services/data";
import { mapServiceToSaleorSeed } from "@/lib/repair-services/seed";

const DEFAULT_CHANNEL = process.env.SERVICE_CHANNEL_SLUG ?? "default-channel";
const DEFAULT_CATEGORY_SLUG =
  process.env.SERVICE_CATEGORY_SLUG ?? "repair-services";

export function GET() {
  const seed = repairServiceCatalog.flatMap((category) =>
    category.services.map((service) =>
      mapServiceToSaleorSeed(service, DEFAULT_CHANNEL, DEFAULT_CATEGORY_SLUG),
    ),
  );

  return NextResponse.json({
    ok: true,
    channel: DEFAULT_CHANNEL,
    category: DEFAULT_CATEGORY_SLUG,
    count: seed.length,
    data: seed,
  });
}

export const runtime = "edge";
