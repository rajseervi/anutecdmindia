import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import CatalogFooter from "@/components/CatalogFooter";
import JsonLd from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anutecdmindia.com/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anutec — Premium Taps & Faucets Manufacturer in India | Bathroom Accessories",
    template: "%s | Anutec",
  },
  description:
    "Anutec is a leading Indian manufacturer of high-quality taps, faucets, and bathroom accessories. Precision-engineered products combining elegant design with lasting durability. Explore our range today!",
  keywords: [
    "taps manufacturer India",
    "faucets manufacturer India",
    "bathroom accessories manufacturer",
    "premium taps India",
    "bathroom faucets manufacturer",
    "Anutec taps",
    "Anutec faucets",
    "bathroom fittings manufacturer",
    "quality taps India",
    "bathroom accessories India",
    "tap manufacturer Hyderabad",
    "faucet manufacturer India",
  ],
  authors: [{ name: "Anutec" }],
  creator: "Anutec",
  publisher: "Anutec",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Anutec",
    title: "Anutec — Premium Taps & Faucets Manufacturer in India",
    description:
      "Precision-engineered bathroom taps, faucets, and accessories manufactured in India. Elegant design, lasting durability — explore the Anutec range.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Anutec — Premium Taps & Faucets Manufacturer India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anutec — Premium Taps & Faucets Manufacturer India",
    description:
      "Indian manufacturer of high-quality bathroom taps, faucets, and accessories. Precision-engineered for lasting performance.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
  category: "Bathroom Fixtures & Accessories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G57WDJV228"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G57WDJV228');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <SessionProvider>
          {/* JSON-LD Structured Data */}
          <JsonLd
            schema={{
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Anutec",
              image: `${siteUrl}/og-image.png`,
              url: siteUrl,
              telephone: "+91-0000000000",
              email: "info@anutec.in",
              description:
                "Anutec is a leading Indian manufacturer of high-quality bathroom taps, faucets, and accessories — precision-engineered for lasting performance and elegant design.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Market Street, Suite 400",
                addressLocality: "Hyderabad",
                addressRegion: "Telangana",
                postalCode: "500001",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 17.385,
                longitude: 78.4867,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  opens: "09:30",
                  closes: "19:30",
                },
              ],
              areaServed: [
                {
                  "@type": "City",
                  name: "Hyderabad",
                },
                {
                  "@type": "City",
                  name: "Secunderabad",
                },
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Premium Taps, Faucets & Bathroom Accessories",
                itemListElement: [
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bathroom Faucets" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Kitchen Taps" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Shower Mixers" } },
                  { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bathroom Accessories" } },
                ],
              },
              sameAs: [
                siteUrl,
              ],
            }}
          />
          <main className="flex-1">{children}</main>
          <CatalogFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
