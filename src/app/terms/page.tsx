"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

const TERMS_SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: [
      "These Terms of Service (\"Terms\") govern your access to and use of the website, products, and services provided by Diamond Marketing And Product Manufacturing (\"Anutec Taps,\" \"we,\" \"us,\" or \"our\"), including all subdomains, mobile applications, and associated services.",
      "By accessing our website, placing an order, or using our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use our website or services.",
      "We reserve the right to update, modify, or replace any part of these Terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services following any changes constitutes acceptance of those changes.",
    ],
  },
  {
    id: "definitions",
    title: "2. Definitions",
    content: [
      "\"Company\" refers to Diamond Marketing And Product Manufacturing, the manufacturer of Anutec Taps brand products.",
      "\"Products\" refers to all bathroom faucets, kitchen taps, shower mixers, bathroom accessories, and any other goods manufactured or sold by the Company under the Anutec Taps brand.",
      "\"Customer\" or \"You\" refers to any individual or entity accessing our website, purchasing products, or using our services.",
      "\"Dealer\" refers to any authorized reseller, distributor, or retailer of Anutec Taps products.",
      "\"Website\" refers to www.anutecdmindia.com and all its subdomains.",
    ],
  },
  {
    id: "products-orders",
    title: "3. Products & Orders",
    content: [
      "3.1 Product Descriptions: We strive to ensure that all product descriptions, specifications, images, and pricing on our website are accurate and up-to-date. However, we do not warrant that product descriptions or other content is completely accurate, reliable, or error-free. Minor variations in colour, finish, or dimensions may occur due to manufacturing tolerances and display settings.",
      "3.2 Order Acceptance: All orders placed through our website are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our sole discretion, including but not limited to orders with incorrect pricing, suspected fraud, or orders exceeding reasonable quantities.",
      "3.3 Pricing: All prices are listed in Indian Rupees (INR) and are exclusive of applicable taxes, shipping, and handling charges unless stated otherwise. We reserve the right to modify prices at any time without prior notice.",
      "3.4 Bulk Orders: For bulk or wholesale orders, separate terms may apply. Please contact our sales team for wholesale pricing and terms.",
    ],
  },
  {
    id: "payment",
    title: "4. Payment Terms",
    content: [
      "Payment for all orders must be made in full before dispatch unless alternative arrangements have been agreed in writing.",
      "We accept payments via bank transfer, UPI, and other electronic payment methods as displayed at checkout.",
      "All payments are processed securely. We do not store or have access to your complete payment card details.",
      "Title to products passes to the Customer upon full payment and dispatch of the order.",
    ],
  },
  {
    id: "shipping-delivery",
    title: "5. Shipping & Delivery",
    content: [
      "5.1 Shipping: We ship products across India through our network of logistics partners. Shipping timelines are estimates and not guaranteed. We are not liable for delays caused by third-party carriers, customs clearance, or force majeure events.",
      "5.2 Delivery: Risk of loss or damage to products passes to the Customer upon delivery. Customers must inspect all shipments upon receipt and report any damage or discrepancies within 48 hours.",
      "5.3 Shipping Charges: Shipping charges are calculated based on order value, weight, dimensions, and delivery location. These charges are non-refundable except in cases of our error.",
    ],
  },
  {
    id: "returns-warranty",
    title: "6. Returns & Warranty",
    content: [
      "6.1 Warranty Coverage: Anutec Taps products are backed by a manufacturing warranty against defects in materials and workmanship. Warranty periods vary by product category and are specified on the product page or product documentation.",
      "6.2 Warranty Exclusions: The warranty does not cover damage resulting from improper installation, misuse, abuse, neglect, accident, modification, unauthorised repair, normal wear and tear, scaling or corrosion due to water conditions, or use of abrasive cleaning agents.",
      "6.3 Returns: Returns are accepted within 7 days of delivery for defective or incorrect products. Products must be unused, in original packaging, and accompanied by proof of purchase. Return shipping costs are borne by the customer unless the return is due to our error.",
      "6.4 Refunds: Upon approval of a return or warranty claim, refunds will be processed to the original payment method within 7-14 business days.",
      "6.5 Warranty Claims: To file a warranty claim, please contact us with your order number, product details, photographs of the defect, and a description of the issue.",
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    content: [
      "All content on this website — including text, graphics, logos, product images, icons, audio clips, digital downloads, data compilations, and software — is the property of Diamond Marketing And Product Manufacturing or its content suppliers and is protected by applicable Indian and international copyright, trademark, and other intellectual property laws.",
      "The Anutec Taps name, logo, and all related product names, design marks, and slogans are trademarks of Diamond Marketing And Product Manufacturing. You may not use, reproduce, distribute, or display any trademarks without our prior written permission.",
      "You may not modify, copy, reproduce, republish, upload, post, transmit, or distribute any content from this website for commercial purposes without our express written consent.",
    ],
  },
  {
    id: "user-conduct",
    title: "8. User Conduct",
    content: [
      "You agree not to use our website or services for any unlawful purpose or in violation of these Terms. Prohibited activities include but are not limited to:",
      "• Attempting to interfere with the proper functioning of our website or security measures",
      "• Uploading or transmitting viruses, malware, or any malicious code",
      "• Engaging in any form of data scraping, data mining, or automated data collection",
      "• Impersonating any person or entity or providing false information",
      "• Violating any applicable laws or regulations in India or your jurisdiction",
    ],
  },
  {
    id: "limitation-liability",
    title: "9. Limitation of Liability",
    content: [
      "To the maximum extent permitted by applicable law, Diamond Marketing And Product Manufacturing, its directors, employees, affiliates, and suppliers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or business interruption, arising out of or in connection with your use of our website, products, or services.",
      "Our total liability for any claim arising from these Terms or your use of our products shall not exceed the purchase price paid by you for the product giving rise to the claim.",
      "Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so the above limitations may not apply to you.",
    ],
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    content: [
      "You agree to indemnify, defend, and hold harmless Diamond Marketing And Product Manufacturing, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising out of or related to: (a) your use of our website or services; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) any content you submit to our website.",
    ],
  },
  {
    id: "governing-law",
    title: "11. Governing Law & Dispute Resolution",
    content: [
      "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.",
      "Before initiating any legal proceedings, we encourage you to contact us to resolve the dispute informally. If we cannot resolve the dispute within 30 days, either party may pursue formal resolution through the appropriate courts.",
    ],
  },
  {
    id: "contact-legal",
    title: "12. Contact Information",
    content: [
      "For questions about these Terms, to file a warranty claim, or for any legal inquiries, please contact us at:",
    ],
    contact: true,
  },
];

export default function TermsPage() {
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
    fetchCompany();
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
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />

      {/* Page Header */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-900 to-indigo-900/30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-400/10 text-blue-300 text-xs font-semibold tracking-wide mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Please read these terms carefully before using our website or purchasing our products.
              These Terms constitute a binding agreement between you and {company.name}.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Last updated: July 2026
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Table of Contents — Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  On This Page
                </h3>
                <nav className="space-y-1">
                  {TERMS_SECTIONS.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-gray-500 hover:text-blue-600 transition-colors py-1.5 border-l-2 border-transparent hover:border-blue-500 pl-3 -ml-3"
                    >
                      {section.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Need Help?</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      If you have questions about these terms, please{" "}
                      <Link href="/contact" className="underline font-medium hover:text-amber-900">
                        contact us
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 lg:p-10">
              <div className="prose prose-slate max-w-none">
                {TERMS_SECTIONS.map((section) => (
                  <div key={section.id} id={section.id} className="mb-10 last:mb-0 scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-gray-600 leading-relaxed mb-3 last:mb-0 text-sm sm:text-base">
                        {paragraph}
                      </p>
                    ))}
                    {section.contact && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-700 font-semibold mb-1">{company.name}</p>
                        <p className="text-sm text-gray-500">
                          Email:{" "}
                          <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-700 font-medium">
                            {company.email}
                          </a>
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone:{" "}
                          <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="text-blue-600 hover:text-blue-700 font-medium">
                            {company.phone}
                          </a>
                        </p>
                        <p className="text-sm text-gray-500">
                          Address: {company.address}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Questions About Our Terms?
              </h3>
              <p className="text-blue-100 text-sm mb-5 max-w-md mx-auto">
                Our team is happy to clarify any aspect of our Terms of Service.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </Link>
            </div>

            {/* Back to top */}
            <div className="mt-6 text-center">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Back to Top
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
