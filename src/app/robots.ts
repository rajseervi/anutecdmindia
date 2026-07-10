import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anutecdmindia.com/";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/inventory/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
