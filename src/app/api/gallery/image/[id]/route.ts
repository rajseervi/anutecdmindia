import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";

/**
 * GET /api/gallery/image/[id]?w=400
 * Proxies an image from Google Drive through the server so the browser
 * doesn't need direct Drive access. The service account handles auth.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: fileId } = await context.params;
  const { searchParams } = new URL(request.url);
  const width = searchParams.get("w") || "800";

  // Build Drive client on each request (keeps token fresh)
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    return NextResponse.json({ error: "Drive not configured" }, { status: 500 });
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  try {
    // Try getting a thumbnail first (much smaller payload)
    const thumbRes = await drive.files.get(
      { fileId, fields: "mimeType" },
      { responseType: "stream" }
    );

    const mimeType = thumbRes.data;

    // Fetch the actual image binary
    const imgRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(imgRes.data as ArrayBuffer);

    // Resize via thumbnail if width param is smaller and it's an image
    // For simplicity, we return the full image with cache headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": (mimeType as { mimeType?: string })?.mimeType || "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error(`[gallery:image] Failed to proxy image ${fileId}:`, err);

    // Fallback: try thumbnail approach
    try {
      const thumbRes = await drive.files.get(
        { fileId, fields: "thumbnailLink" }
      );
      const thumbnailLink = (thumbRes.data as { thumbnailLink?: string })?.thumbnailLink;
      if (thumbnailLink) {
        // Fetch the thumbnail from Drive's generated URL (may work for small sizes)
        const thumbFetch = await fetch(thumbnailLink.replace(/=s\d+/, `=s${width}`), {
          headers: { Authorization: `Bearer ${(auth.credentials as { access_token?: string | null } | null)?.access_token || ""}` },
        });
        if (thumbFetch.ok) {
          const thumbBuffer = Buffer.from(await thumbFetch.arrayBuffer());
          return new NextResponse(thumbBuffer, {
            headers: {
              "Content-Type": "image/jpeg",
              "Cache-Control": "public, max-age=3600, s-maxage=86400",
            },
          });
        }
      }
    } catch {
      // Fallback failed, return error
    }

    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
