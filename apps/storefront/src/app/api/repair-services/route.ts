import { NextResponse } from "next/server";

import { repairServiceCatalog } from "@/lib/repair-services/data";

export function GET() {
  return NextResponse.json({
    ok: true,
    data: repairServiceCatalog,
    generatedAt: new Date().toISOString(),
  });
}

export const runtime = "edge";
