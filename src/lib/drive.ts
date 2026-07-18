import { google, drive_v3 } from "googleapis";
import { Readable } from "stream";

/**
 * Google Drive Gallery Configuration
 *
 * PREREQUISITES:
 * 1. Go to https://console.cloud.google.com/ → APIs & Services → Enable the Google Drive API.
 * 2. Create a Service Account (IAM & Admin → Service Accounts).
 * 3. Download the JSON key file for that service account.
 * 4. Convert the JSON to a single-line string. On Windows PowerShell:
 *      $json = Get-Content "path-to-key.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
 *    Then copy the output.
 * 5. Add to .env.local:
 *      GOOGLE_DRIVE_CLIENT_EMAIL="your-sa@project.iam.gserviceaccount.com"
 *      GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *      GOOGLE_DRIVE_GALLERY_FOLDER_ID="1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
 * 6. In Google Drive, share the target folder with the service account email (Viewer is enough for read-only; Editor needed for delete).
 * 7. The folder must be publicly accessible or shared with the SA.
 */

function getDriveClient(): drive_v3.Drive | null {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.warn("[drive] GOOGLE_DRIVE_CLIENT_EMAIL or GOOGLE_DRIVE_PRIVATE_KEY not set. Gallery disabled.");
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

export function getGalleryFolderId(): string | null {
  return process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID || null;
}

/**
 * List all image files in the configured folder.
 * Returns array of { id, name, webViewLink, thumbnailLink, createdTime }
 */
export async function listGalleryImages(): Promise<
  { id: string; name: string; webViewLink: string; thumbnailLink: string; createdTime: string }[]
> {
  const drive = getDriveClient();
  const folderId = getGalleryFolderId();

  if (!drive || !folderId) {
    console.warn("[drive] Client or folder ID missing.");
    return [];
  }

  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "files(id, name, webViewLink, webContentLink, thumbnailLink, createdTime, mimeType)",
      orderBy: "createdTime desc",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return (res.data.files || []).map((f) => ({
      id: f.id!,
      name: f.name!,
      webViewLink: f.webViewLink || "",
      thumbnailLink: f.thumbnailLink || "",
      createdTime: f.createdTime || "",
    }));
  } catch (err) {
    console.error("[drive] Failed to list gallery images:", err);
    return [];
  }
}

function getDriveClientWithWrite(): drive_v3.Drive | null {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.warn("[drive] GOOGLE_DRIVE_CLIENT_EMAIL or GOOGLE_DRIVE_PRIVATE_KEY not set.");
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Upload an image file to the configured gallery folder.
 * Returns the created file's id/name on success, null on failure.
 */
export async function uploadGalleryImage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ id: string; name: string } | null> {
  const drive = getDriveClientWithWrite();
  const folderId = getGalleryFolderId();

  if (!drive || !folderId) {
    console.warn("[drive] Cannot upload — client or folder ID missing.");
    return null;
  }

  try {
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: Readable.from(fileBuffer),
      },
      fields: "id, name",
      supportsAllDrives: true,
    });

    return { id: res.data.id!, name: res.data.name! };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[drive] Upload failed:", message);
    if (typeof err === "object" && err !== null && "response" in err) {
      const resp = (err as { response?: { status?: number; statusText?: string; data?: unknown } }).response;
      if (resp) {
        console.error("[drive] API response:", resp.status, resp.statusText, JSON.stringify(resp.data));
      }
    }
    return null;
  }
}

/**
 * Delete a file from the gallery folder (requires Edit/Writer permission on the folder).
 */
export async function deleteGalleryImage(fileId: string): Promise<boolean> {
  const drive = getDriveClientWithWrite();
  if (!drive) return false;

  try {
    await drive.files.delete({ fileId, supportsAllDrives: true });
    return true;
  } catch (err) {
    console.error("[drive] Failed to delete file:", err);
    return false;
  }
}
