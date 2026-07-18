"use client";

import { useEffect, useState, useCallback } from "react";
import { ContactContent, FooterContent, DEFAULT_CONTACT, DEFAULT_FOOTER } from "@/types/content";
import { useToast } from "@/app/admin/_components/Toast";

type TabType = "contact" | "footer";

export default function AdminContentPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("contact");
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT);
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content");
      const data = await res.json();
      if (res.ok) {
        setContact(data.contact || DEFAULT_CONTACT);
        setFooter(data.footer || DEFAULT_FOOTER);
      } else {
        addToast(data.error || "Failed to load content", "error");
      }
    } catch {
      addToast("Failed to load content settings", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, footer }),
      });
      if (res.ok) {
        addToast("Content updated successfully", "success");
      } else {
        const err = await res.json();
        addToast(err.error || "Save failed", "error");
      }
    } catch {
      addToast("Failed to save content", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateContact = (field: string, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (icon: string, url: string) => {
    setContact((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((l) => (l.icon === icon ? { ...l, url } : l)),
    }));
  };

  const updateFooter = (field: string, value: string | boolean) => {
    setFooter((prev) => ({ ...prev, [field]: value }));
  };

  const updateCategory = (index: number, field: "name" | "description", value: string) => {
    setFooter((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  const updateFooterLink = (index: number, field: "label" | "url", value: string) => {
    setFooter((prev) => ({
      ...prev,
      footerLinks: prev.footerLinks.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading content settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage footer content, contact details, and social links</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save All Changes</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab("contact")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "contact" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Details
          </span>
        </button>
        <button onClick={() => setActiveTab("footer")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "footer" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Footer Content
          </span>
        </button>
      </div>

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Core Contact Info */}
          <div className="bento-card">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" value={contact.phone} onChange={(e) => updateContact("phone", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="info@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input type="text" value={contact.address} onChange={(e) => updateContact("address", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="Company address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Hours (Weekdays)</label>
                <input type="text" value={contact.businessHours} onChange={(e) => updateContact("businessHours", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="9:30 AM - 7:30 PM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weekend Hours</label>
                <input type="text" value={contact.weekendHours} onChange={(e) => updateContact("weekendHours", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="10:00 AM - 5:00 PM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Closed Day</label>
                <input type="text" value={contact.closedDay} onChange={(e) => updateContact("closedDay", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="Sunday" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Map Embed URL</label>
                <input type="url" value={contact.mapEmbedUrl} onChange={(e) => updateContact("mapEmbedUrl", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                  placeholder="https://maps.google.com/?q=..." />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bento-card">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.socialLinks.map((link) => (
                <div key={link.icon}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                    <span className="inline-flex items-center gap-2">
                      {link.icon === "facebook" && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      )}
                      {link.icon === "instagram" && (
                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      )}
                      {link.icon === "youtube" && (
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      )}
                      {link.icon === "whatsapp" && (
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      )}
                      {link.label}
                    </span>
                  </label>
                  <input type="url" value={link.url} onChange={(e) => updateSocialLink(link.icon, e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                    placeholder={`${link.label} URL`} />
                </div>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          <div className="bento-card bg-gradient-to-br from-slate-50 to-white">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview — Contact Page
            </h3>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <p className="text-sm font-medium text-slate-900">{contact.phone}</p>
              <p className="text-sm text-indigo-600">{contact.email}</p>
              <p className="text-sm text-slate-500 mt-1">{contact.address}</p>
              <div className="flex gap-2 mt-2">
                {contact.socialLinks.filter((l) => l.url && l.url !== "#").map((l) => (
                  <span key={l.icon} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{l.icon}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === "footer" && (
        <div className="space-y-5 animate-fadeIn">
          {/* About Section */}
          <div className="bento-card">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About Company</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">About Text (Footer)</label>
              <textarea value={footer.aboutText} onChange={(e) => updateFooter("aboutText", e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white resize-none"
                placeholder="Leave empty to use default description" />
              <p className="text-xs text-slate-400 mt-1.5">If empty, the default company description from settings will be used.</p>
            </div>
          </div>

          {/* Badges & Legal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bento-card">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Badges & Labels</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={footer.showIsoBadge}
                    onChange={(e) => updateFooter("showIsoBadge", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">Show ISO Badge</span>
                </label>
                {footer.showIsoBadge && (
                  <input type="text" value={footer.isoLabel} onChange={(e) => updateFooter("isoLabel", e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 ml-7"
                    placeholder="ISO 9001 Certified Manufacturer" />
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={footer.showMadeInIndia}
                    onChange={(e) => updateFooter("showMadeInIndia", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">Show &ldquo;Made in India&rdquo; Badge</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                  <input type="text" value={footer.gstin} onChange={(e) => updateFooter("gstin", e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="GSTIN: XX-XXXXX-XXXXX-XX" />
                </div>
              </div>
            </div>

            <div className="bento-card">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Footer Links</h2>
              <div className="space-y-3">
                {footer.footerLinks.map((link, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Label</label>
                        <input type="text" value={link.label} onChange={(e) => updateFooterLink(i, "label", e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">URL</label>
                        <input type="text" value={link.url} onChange={(e) => updateFooterLink(i, "url", e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div className="bento-card">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Product Categories (Footer)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {footer.categories.map((cat, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="mb-2">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Category Name</label>
                    <input type="text" value={cat.name} onChange={(e) => updateCategory(i, "name", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                    <input type="text" value={cat.description} onChange={(e) => updateCategory(i, "description", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-indigo-500 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="bento-card">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Copyright</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Copyright Text (after &ldquo;All rights reserved.&rdquo;)</label>
              <input type="text" value={footer.copyrightText} onChange={(e) => updateFooter("copyrightText", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white"
                placeholder="Premium Taps & Faucets — Made in India" />
              <p className="text-xs text-slate-400 mt-1.5">The year and company name are automatically prepended.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
