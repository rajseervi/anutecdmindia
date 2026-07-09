import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anutecdmindia.com/";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* ── Static pages ──────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/scan`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${siteUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  /* ── Dynamic product pages ─────────────────────────── */
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${siteUrl}/api/products?limit=-1&includeHidden=false`, {
      // Allow up to 15s for large product catalogs
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (data?.products?.length) {
      productUrls = data.products.map(
        (p: { id: string }): MetadataRoute.Sitemap[number] => ({
          url: `${siteUrl}/product/${encodeURIComponent(p.id)}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      );
    }
  } catch {
    // API unreachable — omit dynamic pages gracefully
    console.warn("[sitemap] Could not fetch products — serving static-only sitemap.");
  }

  return [...staticPages, ...productUrls];
}
