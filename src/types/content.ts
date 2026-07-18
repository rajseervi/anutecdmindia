export interface ContactContent {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  weekendHours: string;
  closedDay: string;
  mapEmbedUrl: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  icon: string; // 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'whatsapp'
}

export interface FooterContent {
  aboutText: string;
  showIsoBadge: boolean;
  isoLabel: string;
  showMadeInIndia: boolean;
  gstin: string;
  copyrightText: string;
  footerLinks: FooterLink[];
  categories: FooterCategory[];
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterCategory {
  name: string;
  description: string;
}

export interface BrandContent {
  brands: BrandInfo[];
}

export interface BrandInfo {
  name: string;
  badgeColor: string;
  isActive: boolean;
}

export const DEFAULT_CONTACT: ContactContent = {
  phone: "+91 98765 43210",
  email: "diamondmanufacturing950@gmail.com",
  address: "Diamond Marketing And Product Manufacturing, Hyderabad, India",
  businessHours: "9:30 AM – 7:30 PM",
  weekendHours: "10:00 AM – 5:00 PM",
  closedDay: "Sunday",
  mapEmbedUrl: "",
  socialLinks: [
    { platform: "facebook", label: "Facebook", url: "#", icon: "facebook" },
    { platform: "instagram", label: "Instagram", url: "#", icon: "instagram" },
    { platform: "youtube", label: "YouTube", url: "#", icon: "youtube" },
  ],
};

export const DEFAULT_FOOTER: FooterContent = {
  aboutText: "",
  showIsoBadge: true,
  isoLabel: "ISO 9001 Certified Manufacturer",
  showMadeInIndia: true,
  gstin: "GSTIN: XX-XXXXX-XXXXX-XX",
  copyrightText: "All rights reserved. | Premium Taps & Faucets — Made in India",
  footerLinks: [
    { label: "Privacy Policy", url: "/privacy" },
    { label: "Terms of Service", url: "/terms" },
    { label: "Sitemap", url: "/sitemap" },
  ],
  categories: [
    { name: "Bathroom Faucets", description: "Basin Mixers & Pillar Taps" },
    { name: "Kitchen Taps", description: "Sink Mixers & Pull-Outs" },
    { name: "Shower Mixers", description: "Thermostatic & Manual" },
    { name: "Accessories", description: "Towel Rails & More" },
  ],
};
