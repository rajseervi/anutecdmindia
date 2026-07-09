/**
 * Converts Google Drive share/view links to embeddable image URLs.
 * Handles formats:
 *   - drive.google.com/file/d/FILE_ID/view
 *   - drive.google.com/open?id=FILE_ID
 *   - Already in uc?export=view&id=FILE_ID format (pass-through)
 * Returns the original URL if no Google Drive pattern is detected.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;

  // Already in the embeddable format — return as-is
  if (url.includes("googleusercontent.com") || url.includes("/uc?")) {
    return url;
  }

  // Pattern 1: drive.google.com/file/d/FILE_ID/view...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  // Pattern 2: drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  // Not a Google Drive URL — return unchanged
  return url;
}
