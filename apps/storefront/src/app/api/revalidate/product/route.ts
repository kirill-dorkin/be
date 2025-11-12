import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { slug?: string };
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 }
      );
    }

    // Revalidate specific product
    revalidateTag(`PRODUCT:${slug}`);

    // Revalidate all product detail pages
    revalidateTag("DETAIL-PAGE:PRODUCT");

    return NextResponse.json({
      revalidated: true,
      slug,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error revalidating", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// For development: allow GET requests
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Product slug is required as query parameter: ?slug=your-product-slug" },
      { status: 400 }
    );
  }

  try {
    revalidateTag(`PRODUCT:${slug}`);
    revalidateTag("DETAIL-PAGE:PRODUCT");

    return NextResponse.json({
      revalidated: true,
      slug,
      message: `Product cache cleared for: ${slug}`,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error revalidating", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
