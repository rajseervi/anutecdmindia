import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * GET /api/image/[id]?w=800
 * PUBLIC endpoint — anyone can access. Proxies an image from Google Drive
 * through the server so it can be used in <img> tags anywhere on the site.
 * Cached aggressively via Cache-Control headers.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: fileId } = await context.params;
  const { searchParams } = new URL(request.url);
  const width = searchParams.get("w") || "800";

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
    // Get file metadata for content-type, then fetch binary
    const [metaRes, imgRes] = await Promise.all([
      drive.files.get({ fileId, fields: "mimeType" }),
      drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      ),
    ]);

    const mimeType = (metaRes.data as { mimeType?: string }).mimeType || "image/jpeg";
    const buffer = Buffer.from(imgRes.data as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    // Fallback: try thumbnail
    try {
      const thumbRes = await drive.files.get({ fileId, fields: "thumbnailLink" });
      const thumbnailLink = (thumbRes.data as { thumbnailLink?: string }).thumbnailLink;
      if (thumbnailLink) {
        const thumbUrl = thumbnailLink.replace(/=s\d+/, `=s${width}`);
        const thumbFetch = await fetch(thumbUrl);
        if (thumbFetch.ok) {
          const thumbBuffer = Buffer.from(await thumbFetch.arrayBuffer());
          return new NextResponse(thumbBuffer, {
            headers: {
              "Content-Type": "image/jpeg",
              "Cache-Control": "public, max-age=86400, s-maxage=604800",
            },
          });
        }
      }
    } catch {
      // both approaches failed
    }

    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
