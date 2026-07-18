"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

const PRIVACY_SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: [
      "Diamond Marketing And Product Manufacturing (\"Anutec Taps,\" \"we,\" \"us,\" or \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.anutecdmindia.com, use our services, or interact with us.",
      "We comply with the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, as applicable in India.",
      "Please read this Privacy Policy carefully. By accessing our website or using our services, you acknowledge that you have read and understood this policy.",
    ],
  },
  {
    id: "information-collect",
    title: "2. Information We Collect",
    content: [
      "We may collect the following types of information when you visit our website or interact with us:",
      "",
    ],
    list: [
      {
        category: "Personal Information You Provide",
        items: [
          "Name, email address, phone number, and shipping/billing address when you place an order or submit an inquiry",
          "Company name and GSTIN when registering as a dealer or distributor",
          "Payment information (processed securely through third-party payment gateways — we do not store complete payment card details)",
          "Any other information you choose to share through contact forms, email, or phone calls",
        ],
      },
      {
        category: "Information Collected Automatically",
        items: [
          "IP address, browser type, device type, operating system, and browsing behaviour through cookies and similar technologies",
          "Pages viewed, time spent on pages, referring URL, and other website usage analytics",
          "Location data (approximate, based on IP address)",
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "3. Cookies & Tracking Technologies",
    content: [
      "We use cookies and similar tracking technologies to enhance your browsing experience, analyse website traffic, and understand where our visitors come from.",
      "Types of cookies we use:",
    ],
    list: [
      {
        category: "Essential Cookies",
        items: [
          "Required for the basic functionality of our website, such as session management and security.",
        ],
      },
      {
        category: "Analytics Cookies",
        items: [
          "Help us understand how visitors interact with our website by collecting anonymised data on page views, traffic sources, and user behaviour. We use Google Analytics for this purpose.",
        ],
      },
      {
        category: "Functional Cookies",
        items: [
          "Remember your preferences and settings to provide a personalised experience.",
        ],
      },
    ],
    additionalContent: [
      "You can control cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of our website.",
    ],
  },
  {
    id: "use-of-information",
    title: "4. How We Use Your Information",
    content: [
      "We use the information we collect for the following purposes:",
    ],
    list: [
      {
        category: "",
        items: [
          "To process and fulfil your orders, including shipping, warranty registration, and customer support",
          "To communicate with you regarding your orders, inquiries, and account",
          "To send you product updates, promotional offers, and newsletters (with your consent where required by law)",
          "To improve our website, products, and services based on your feedback and usage patterns",
          "To prevent fraud, enforce our terms of service, and comply with legal obligations",
          "To analyse website traffic and user behaviour for business analytics",
        ],
      },
    ],
  },
  {
    id: "information-sharing",
    title: "5. Information Sharing & Disclosure",
    content: [
      "We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:",
    ],
    list: [
      {
        category: "",
        items: [
          "With trusted third-party service providers who assist us in operating our website, processing payments, delivering shipments, or conducting business analytics — under strict confidentiality agreements",
          "With law enforcement, government authorities, or legal entities when required by applicable law, court order, or to protect our legal rights",
          "In connection with a business transfer, merger, or acquisition (with notice to you)",
          "With your explicit consent or at your direction",
        ],
      },
    ],
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: [
      "We implement reasonable physical, electronic, and managerial security measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction.",
      "All sensitive data transmitted between your browser and our website is encrypted using SSL/TLS technology. Our payment processing partners adhere to PCI DSS standards.",
      "However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to protect your information to the best of our ability.",
    ],
  },
  {
    id: "data-retention",
    title: "7. Data Retention",
    content: [
      "We retain your personal information only for as long as necessary to fulfil the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.",
      "When we no longer need your information, we will securely delete or anonymise it. Order-related data may be retained for accounting and tax compliance as required by Indian law.",
    ],
  },
  {
    id: "your-rights",
    title: "8. Your Rights & Choices",
    content: [
      "Under applicable data protection laws, you have the following rights regarding your personal information:",
    ],
    list: [
      {
        category: "",
        items: [
          "Right to Access: Request a copy of the personal information we hold about you",
          "Right to Correction: Request correction of inaccurate or incomplete information",
          "Right to Deletion: Request deletion of your personal information, subject to legal retention requirements",
          "Right to Withdraw Consent: Withdraw any consent you have provided for processing your data",
          "Right to Opt-Out: Unsubscribe from marketing communications at any time using the link in our emails or by contacting us",
        ],
      },
    ],
    additionalContent: [
      "To exercise any of these rights, please contact us using the information in Section 11. We will respond to your request within the timeframe required by applicable law.",
    ],
  },
  {
    id: "children-privacy",
    title: "9. Children's Privacy",
    content: [
      "Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information promptly.",
    ],
  },
  {
    id: "policy-changes",
    title: "10. Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or operational reasons. We will notify you of material changes by posting the updated policy on this page with a revised \"Last Updated\" date.",
      "We encourage you to review this Privacy Policy periodically. Your continued use of our website after any changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    id: "contact-privacy",
    title: "11. Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:",
    ],
    contact: true,
  },
];

export default function PrivacyPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-teal-900/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300 text-xs font-semibold tracking-wide mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Privacy
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              We respect your privacy and are committed to protecting your personal data.
              This policy explains how we collect, use, and safeguard your information.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Last updated: July 2026
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
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
                  {PRIVACY_SECTIONS.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-gray-500 hover:text-emerald-600 transition-colors py-1.5 border-l-2 border-transparent hover:border-emerald-500 pl-3 -ml-3"
                    >
                      {section.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Your Data Matters</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      We take data protection seriously. If you have concerns,{" "}
                      <Link href="/contact" className="underline font-medium hover:text-emerald-900">
                        reach out to us
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
                {PRIVACY_SECTIONS.map((section) => (
                  <div key={section.id} id={section.id} className="mb-10 last:mb-0 scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    {section.content.map((paragraph, idx) => (
                      paragraph === "" ? null :
                      <p key={idx} className="text-gray-600 leading-relaxed mb-3 last:mb-0 text-sm sm:text-base">
                        {paragraph}
                      </p>
                    ))}

                    {/* Lists */}
                    {section.list && section.list.map((listGroup, gIdx) => (
                      <div key={gIdx} className="mb-4 last:mb-0">
                        {listGroup.category && (
                          <h3 className="text-sm font-bold text-gray-700 mb-2 mt-4">
                            {listGroup.category}
                          </h3>
                        )}
                        <ul className="space-y-2">
                          {listGroup.items.map((item, iIdx) => (
                            <li key={iIdx} className="flex items-start gap-2.5 text-gray-600 text-sm sm:text-base leading-relaxed">
                              <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Additional content after lists */}
                    {section.additionalContent && section.additionalContent.map((paragraph, idx) => (
                      <p key={`add-${idx}`} className="text-gray-600 leading-relaxed mb-3 last:mb-0 text-sm sm:text-base mt-3">
                        {paragraph}
                      </p>
                    ))}

                    {section.contact && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-700 font-semibold mb-1">{company.name}</p>
                        <p className="text-sm text-gray-500">
                          Email:{" "}
                          <a href={`mailto:${company.email}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                            {company.email}
                          </a>
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone:{" "}
                          <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
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
            <div className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Privacy Questions?
              </h3>
              <p className="text-emerald-100 text-sm mb-5 max-w-md mx-auto">
                If you have any concerns about how we handle your data, please get in touch.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-all shadow-lg active:scale-[0.97]"
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
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 transition-colors"
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
