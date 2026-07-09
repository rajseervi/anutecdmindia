"use client";

import { useEffect, useState } from "react";
import nextDynamic from "next/dynamic";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";
import ProblemBanner from "@/components/home/ProblemBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import WhyAnutec from "@/components/home/WhyAnutec";
import StatsCounter from "@/components/home/StatsCounter";
import CTABanner from "@/components/home/CTABanner";

const BackgroundPaths = nextDynamic(
  () => import("@/components/ui/modern-background-paths"),
  { ssr: false }
);

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const { isScrolled } = useScrollBehavior();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch {
        // fallback to defaults
      }
    };
    const timer = setTimeout(() => fetchCompany(), 600);
    return () => clearTimeout(timer);
  }, []);

  const headerConfig: CatalogHeaderConfig = {
    companyName: company.name,
    tagline: company.tagline,
    totalProducts: 0,
    searchTerm: "",
    isSearching: false,
    isScrolled,
    phone: company.phone,
    email: company.email,
  };

  return (
    <div className="min-h-screen bg-white">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />
      <BackgroundPaths title="Anutec Taps" />
      <ProblemBanner />
      <FeaturedCategories />
      <WhyAnutec />
      <StatsCounter />
      <CTABanner phone={company.phone} />
    </div>
  );
}
