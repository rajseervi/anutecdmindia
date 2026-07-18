import { promises as fs } from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

/**
 * List all image files in the public/uploads/gallery/ directory.
 */
export async function listStorageImages(): Promise<
  { id: string; name: string; webViewLink: string; thumbnailLink: string; createdTime: string }[]
> {
  try {
    await fs.mkdir(GALLERY_DIR, { recursive: true });
    const entries = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile() && e.name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff|ico)$/i));

    const items = await Promise.all(
      files.map(async (f) => {
        const filePath = path.join(GALLERY_DIR, f.name);
        const stat = await fs.stat(filePath);
        const publicUrl = `/uploads/gallery/${f.name}`;
        return {
          id: f.name,
          name: f.name,
          webViewLink: publicUrl,
          thumbnailLink: publicUrl,
          createdTime: stat.birthtime.toISOString(),
        };
      })
    );

    return items.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
  } catch (err) {
    console.error("[gallery-storage] Failed to list images:", err);
    return [];
  }
}

/**
 * Upload a file to public/uploads/gallery/.
 */
export async function uploadGalleryFile(
  fileBuffer: Buffer,
  fileName: string,
  _mimeType: string
): Promise<{ id: string; name: string } | null> {
  try {
    await fs.mkdir(GALLERY_DIR, { recursive: true });

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const finalName = `${timestamp}_${safeName}`;
    const filePath = path.join(GALLERY_DIR, finalName);

    await fs.writeFile(filePath, fileBuffer);

    return { id: finalName, name: safeName };
  } catch (err) {
    console.error("[gallery-storage] Upload failed:", err);
    return null;
  }
}

/**
 * Delete a file from public/uploads/gallery/.
 */
export async function deleteStorageFile(fileId: string): Promise<boolean> {
  try {
    const filePath = path.join(GALLERY_DIR, fileId);
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    console.error("[gallery-storage] Delete failed:", err);
    return false;
  }
}
