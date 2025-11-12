import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Revalidate all pages
    revalidatePath("/", "layout");

    return NextResponse.json({
      revalidated: true,
      message: "All caches cleared",
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
export async function GET() {
  try {
    revalidatePath("/", "layout");

    return NextResponse.json({
      revalidated: true,
      message: "All caches cleared",
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error revalidating", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
