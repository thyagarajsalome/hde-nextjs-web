// src/app/api/plans/download/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");
    const rawTitle = searchParams.get("title") || "house_plan";

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Missing required 'url' parameter" },
        { status: 400 }
      );
    }

    // Validate URL to prevent arbitrary SSRF attacks
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(fileUrl);
    } catch {
      return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
    }

    const allowedHostPatterns = [
      "r2.dev",
      "cloudflare.com",
      "homedesignenglish.com",
      "localhost",
      "supabase.co",
    ];

    const isAllowed = allowedHostPatterns.some(
      (host) =>
        parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Forbidden: Download origin not permitted" },
        { status: 403 }
      );
    }

    // Fetch the file on the server side (bypasses browser CORS completely)
    const upstreamRes = await fetch(parsedUrl.toString(), {
      headers: {
        Accept: "image/*,application/octet-stream,*/*",
      },
    });

    if (!upstreamRes.ok) {
      console.error(
        `[Plans Download] Upstream fetch failed (${upstreamRes.status}):`,
        parsedUrl.toString()
      );
      return NextResponse.json(
        { error: `Upstream resource failed: ${upstreamRes.statusText}` },
        { status: upstreamRes.status }
      );
    }

    const contentType =
      upstreamRes.headers.get("content-type") || "image/webp";
    const arrayBuffer = await upstreamRes.arrayBuffer();

    // Determine extension from content-type or original URL
    let extension = "webp";
    if (contentType.includes("png") || parsedUrl.pathname.endsWith(".png")) {
      extension = "png";
    } else if (
      contentType.includes("jpeg") ||
      contentType.includes("jpg") ||
      parsedUrl.pathname.endsWith(".jpg") ||
      parsedUrl.pathname.endsWith(".jpeg")
    ) {
      extension = "jpg";
    } else if (contentType.includes("pdf") || parsedUrl.pathname.endsWith(".pdf")) {
      extension = "pdf";
    }

    // Sanitize filename
    const sanitizedTitle = rawTitle
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 80);
    const finalFilename = `${sanitizedTitle || "house_plan"}.${extension}`;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.error("[Plans Download Route Error]:", err);
    return NextResponse.json(
      { error: "Failed to process blueprint download: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
