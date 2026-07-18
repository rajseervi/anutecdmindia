# Google Drive Image Gallery — Implementation Guide

## Overview

The admin panel now includes a full-featured **Image Gallery** (`/admin/gallery`) that syncs images from a designated Google Drive folder. Images are proxied through the server (no CORS/auth issues), can be accessed publicly via a copiable URL, and the preview includes zoom, pan, filmstrip navigation, and download.

---

## Files Created / Modified

| File | Type | Purpose |
|------|------|---------|
| `src/lib/drive.ts` | New | Google Drive service account client — lists/deletes files |
| `src/app/api/gallery/route.ts` | New | `GET` list images, `DELETE` remove image (auth required) |
| `src/app/api/gallery/image/[id]/route.ts` | New | Proxies image binary through server (auth required) |
| `src/app/api/image/[id]/route.ts` | New | **Public** image proxy — no auth, heavy caching (7d) |
| `src/app/admin/gallery/page.tsx` | New | Full admin gallery UI |
| `src/app/admin/_components/AdminSidebar.tsx` | Modified | Added "Gallery" nav link |
| `.env.local` | Modified | Added 3 Drive env vars |

---

## Step-by-Step Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Google Drive API** (APIs & Services → Library)
3. Create a **Service Account** (IAM & Admin → Service Accounts)
4. Download the JSON key

### 2. Extract Credentials (PowerShell)

```powershell
$j = Get-Content "C:\path\to\key.json" -Raw | ConvertFrom-Json
Write-Host "GOOGLE_DRIVE_CLIENT_EMAIL=$($j.client_email)"
Write-Host "GOOGLE_DRIVE_PRIVATE_KEY=$($j.private_key -replace "`n",'\n' -replace "`r",'')"
```

### 3. Add to `.env.local`

```
GOOGLE_DRIVE_CLIENT_EMAIL=google-drive-api@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_DRIVE_GALLERY_FOLDER_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

> **Important:** The `PRIVATE_KEY` must use literal `\n` characters (not actual newlines).  
> The folder ID comes from the Drive folder URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### 4. Share the Drive Folder

In Google Drive, right-click the folder → **Share** → add the service account email:
- **Viewer** — if you only need to list/display images
- **Editor** — if you also need the delete button to work

### 5. Restart Dev Server

```bash
npm run dev
```

Visit `/admin/gallery` — images should appear.

---

## Architecture

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  Admin Gallery   │────▶│  /api/gallery (GET)   │────▶│  Google Drive │
│  (Browser)       │     │  /api/gallery (DELETE) │     │  API v3       │
└──────────────────┘     └──────────────────────┘     └──────────────┘
         │                         │
         │ Image src:              │ Image binary proxy:
         │ /api/image/[id]         │ /api/gallery/image/[id]
         │ (PUBLIC, cached)        │ (AUTH required)
         ▼                         ▼
    Any <img> tag              Lightbox preview
    on any page                (admin only)
```

Two image endpoints exist:

| Endpoint | Auth | Cache | Use Case |
|----------|------|-------|----------|
| `/api/image/[id]` | **None** | 7 days | Public `<img>` tags, banners, products |
| `/api/gallery/image/[id]` | Session | 24h | Admin lightbox (session-bound) |

---

## Gallery Features

### Thumbnail Grid
- Responsive grid (2–5 columns)
- Lazy-loaded images via proxy
- Copy URL + Delete buttons on each card
- Image count and refresh button in header

### Full-Screen Lightbox
- **Dark immersive overlay** with backdrop blur
- **Prev/Next navigation** — click arrows or use `←` `→` keys
- **Esc** to close, or **Esc** once to reset zoom, second time to close

### Zoom & Pan
| Interaction | Behavior |
|-------------|----------|
| **Scroll wheel** | Zoom in/out, centered on cursor position |
| **Click** | Toggle between 1× and 2.5× zoom, centered on click |
| **Double-click** | Step zoom 1× → 2× → 3× → 1×, toward cursor |
| **Drag** | Pan when zoomed in, with soft boundary clamping |
| **Pinch** | Two-finger pinch-to-zoom on touch devices |

### Filmstrip
- 5-thumbnail row at bottom of lightbox
- Active thumbnail highlighted with amber border
- Click any thumbnail to jump to that image

### Download
- Downloads full-resolution image from Drive
- Filename preserved

### Copy URL
- Copies `https://yoursite.com/api/image/FILE_ID?w=1200` to clipboard
- URL works **without authentication** — paste into any `<img>` tag

---

## API Reference

### `GET /api/gallery`
**Auth required:** Yes (session)  
**Response:**
```json
{
  "images": [
    {
      "id": "1aBcDeFg...",
      "name": "product-photo.jpg",
      "webViewLink": "https://drive.google.com/file/d/.../view",
      "thumbnailLink": "https://lh3.googleusercontent.com/...",
      "createdTime": "2026-07-15T10:30:00.000Z"
    }
  ]
}
```

### `DELETE /api/gallery?fileId=xxx`
**Auth required:** Yes (session)  
**Response:** `{ "success": true }`

### `GET /api/image/[id]?w=800`
**Auth required:** No  
**Response:** Binary image (JPEG/PNG) with `Cache-Control: public, max-age=86400`

### `GET /api/gallery/image/[id]?w=800`
**Auth required:** Yes (session)  
**Response:** Binary image (JPEG/PNG) with `Cache-Control: public, max-age=3600`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Images not loading | Check `GOOGLE_DRIVE_GALLERY_FOLDER_ID` is correct and folder is shared with SA |
| Delete button fails | SA needs **Editor** permission on the folder |
| 401 Unauthorized | Only `/api/image/[id]` is public; admin routes need login |
| Build fails with type errors | Pre-existing lint errors in `content/page.tsx` and `api/content/route.ts` — unrelated to gallery |
| Some images show broken | Drive link sharing may be restricted; ensure files are not "Restricted" in Drive sharing settings |

---

## Security

- **Admin gallery page** is protected by NextAuth middleware (`/admin/:path*`)
- **`/api/gallery`** (list + delete) requires valid session via `getServerSession`
- **`/api/gallery/image/[id]`** requires session
- **`/api/image/[id]`** is intentionally public (cached) for use in `<img>` tags
- Service account uses **readonly** scope (`drive.readonly`) — cannot modify files outside the shared folder
- Service account private key never exposed to browser
