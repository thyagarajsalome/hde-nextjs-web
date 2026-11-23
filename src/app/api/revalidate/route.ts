// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { BANGALORE_LOCALITIES } from "@/data/bangaloreLocalities";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { paths = [], slug, localitySlug, localityName } = body;

    const toRevalidate: Set<string> = new Set();

    // 1. Explicit paths if provided
    if (Array.isArray(paths)) {
      paths.forEach((p) => {
        if (typeof p === "string" && p.startsWith("/")) {
          toRevalidate.add(p);
        }
      });
    }

    // 2. Direct slug
    if (slug && typeof slug === "string") {
      toRevalidate.add(`/bangalore/${slug}`);
    }

    // 3. Resolve locality slug (from localitySlug or localityName)
    let targetLocSlug = localitySlug;
    if (!targetLocSlug && localityName) {
      const match = BANGALORE_LOCALITIES.find(
        (l) => l.name.toLowerCase() === localityName.toLowerCase() || l.slug === localityName.toLowerCase()
      );
      if (match) targetLocSlug = match.slug;
    }

    if (targetLocSlug) {
      toRevalidate.add(`/bangalore/properties-in-${targetLocSlug}`);
      toRevalidate.add(`/bangalore/flats-for-rent-in-${targetLocSlug}`);
      toRevalidate.add(`/bangalore/house-for-rent-in-${targetLocSlug}`);
      toRevalidate.add(`/bangalore/plots-for-sale-in-${targetLocSlug}`);
    }

    // Always revalidate the main directory page
    toRevalidate.add("/bangalore/properties");

    // Execute on-demand revalidations
    const revalidatedList: string[] = [];
    for (const path of toRevalidate) {
      try {
        revalidatePath(path);
        revalidatedList.push(path);
      } catch (pathErr) {
        console.warn(`[revalidate] Failed path: ${path}`, pathErr);
      }
    }

    return NextResponse.json({
      revalidated: true,
      count: revalidatedList.length,
      paths: revalidatedList,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[revalidate] Global error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
