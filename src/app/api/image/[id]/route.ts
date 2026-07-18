import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * GET /api/image/[id]?w=800
 * PUBLIC endpoint — anyone can access.
 * Proxies images from Google Drive (by file ID) or Firebase Storage (by path like gallery/xxx.jpg).
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: fileId } = await context.params;
  const { searchParams } = new URL(request.url);
  const width = searchParams.get("w") || "800";

  // --- Firebase Storage handler (e.g., gallery/1234567890_photo.jpg) ---
  if (fileId.startsWith("gallery/")) {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fileId)}?alt=media`;
    try {
      const res = await fetch(storageUrl);
      if (!res.ok) throw new Error(`Storage fetch failed: ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": res.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
          "Content-Length": buffer.length.toString(),
        },
      });
    } catch {
      return NextResponse.json({ error: "Failed to load image from storage" }, { status: 500 });
    }
  }

  // --- Google Drive handler ---
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
