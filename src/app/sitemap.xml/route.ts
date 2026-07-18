import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anutecdmindia.com/";

function generateSitemapXml(sitemap: MetadataRoute.Sitemap): string {
  const entries = sitemap
    .map((entry) => {
      const lastmod = entry.lastModified
        ? `<lastmod>${entry.lastModified instanceof Date
            ? entry.lastModified.toISOString()
            : new Date(entry.lastModified).toISOString()
          }</lastmod>`
        : "";
      const changefreq = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority = entry.priority !== undefined
        ? `<priority>${entry.priority}</priority>`
        : "";

      return `  <url>
    <loc>${entry.url}</loc>
    ${lastmod}
    ${changefreq}
    ${priority}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export async function GET(): Promise<Response> {
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
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
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
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    },
    {
      url: `${siteUrl}/sitemap`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  /* ── Dynamic product pages ─────────────────────────── */
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${siteUrl}/api/products?limit=-1&includeHidden=false`, {
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
    console.warn("[sitemap] Could not fetch products — serving static-only sitemap.");
  }

  const fullSitemap = [...staticPages, ...productUrls];
  const xml = generateSitemapXml(fullSitemap);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
