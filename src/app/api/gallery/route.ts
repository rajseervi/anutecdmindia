import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listGalleryImages, deleteGalleryImage, uploadGalleryImage } from "@/lib/drive";

/**
 * GET /api/gallery — List all images in the configured Google Drive folder.
 * Requires authentication (session).
 */
export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const images = await listGalleryImages();
    return NextResponse.json({ images });
  } catch (err) {
    console.error("[gallery:GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
  }
}

/**
 * DELETE /api/gallery?fileId=xxx — Remove a single image from the Drive folder.
 * Requires authentication (session).
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "fileId query parameter is required" }, { status: 400 });
  }

  try {
    const deleted = await deleteGalleryImage(fileId);
    if (!deleted) {
      return NextResponse.json({ error: "Delete failed — check service account permissions" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[gallery:DELETE] Error:", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB

/**
 * POST /api/gallery — Upload an image file to the configured Google Drive folder.
 * Accepts multipart/form-data with a single "file" field.
 * Requires authentication (session).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided or invalid field name. Use 'file'." }, { status: 400 });
    }

    // Validate file type — only images
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed (JPEG, PNG, WebP, etc.)" }, { status: 415 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadGalleryImage(buffer, file.name, file.type);
    if (!result) {
      return NextResponse.json({ error: "Upload failed — check service account Editor permissions on the Drive folder." }, { status: 500 });
    }

    return NextResponse.json({ success: true, file: result }, { status: 201 });
  } catch (err) {
    console.error("[gallery:POST] Error:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
