"use client";

import { FormEvent, useEffect, useState } from "react";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";

const API_URL = '/api/company';

type TabType = 'company' | 'display' | 'contact';

// Force dynamic rendering since this page fetches data on the client
export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  const [form, setForm] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('company');

  useEffect(() => {
    const fetchProfile = async (signal: AbortSignal) => {
      try {
        setLoading(true);
        setErrorMessage('');
        setWarningMessage('');

        const response = await fetch(API_URL, { signal });
        const rawBody = await response
          .clone()
          .json()
          .catch(() => ({ error: 'Failed to parse company settings response.' }));

        if (!response.ok) {
          const details = typeof rawBody?.details === 'string' ? rawBody.details : undefined;
          throw new Error(rawBody.error || details || 'Failed to load company settings');
        }

        if (rawBody.company) {
          setForm({ ...DEFAULT_COMPANY_PROFILE, ...rawBody.company });
          if (rawBody.details) {
            setWarningMessage(rawBody.details);
          }
        } else if (rawBody.warning) {
          setWarningMessage(rawBody.warning);
        } else {
          setWarningMessage('Company profile not found. Showing default values until information is saved.');
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        console.error('Error fetching company settings:', error);
        const message = (error as Error).message || 'Unable to load company settings. Please try again.';
        setErrorMessage(message);
        setWarningMessage(`Reason: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    const controller = new AbortController();
    fetchProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const handleChange = (field: keyof CompanyProfile) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleToggle = (field: keyof CompanyProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update company settings');
      }

      setSuccessMessage('Company profile saved successfully.');
    } catch (error) {
      console.error('Error saving company settings:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-600 mt-2">Manage the branding details that appear on your public catalog.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('company')}
              className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'company'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'contact'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </div>
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'display'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Display Settings
              </div>
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading company settings...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            {/* Company Profile Tab */}
            {activeTab === 'company' && (
              <div className="space-y-8 animate-fadeIn">
                <header>
                  <h2 className="text-2xl font-semibold text-gray-900">Company Profile</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    These details populate the hero card on the catalog home page. Update them whenever your company messaging changes.
                  </p>
                </header>

                <section>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange('name')}
                        placeholder="Acme Fabrics Ltd."
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
                        Tagline
                      </label>
                      <input
                        id="tagline"
                        type="text"
                        value={form.tagline}
                        onChange={handleChange('tagline')}
                        placeholder="Curated products for discerning customers"
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Overview
                    </label>
                    <textarea
                      id="description"
                      value={form.description}
                      onChange={handleChange('description')}
                      placeholder="Introduce your company and highlight key offerings."
                      rows={4}
                      className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </section>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-8 animate-fadeIn">
                <header>
                  <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Provide contact details for customers to reach your business. These will be displayed on your public catalog.
                  </p>
                </header>

                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Support Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        placeholder="support@company.com"
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder="+1 (212) 555-9876"
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        id="website"
                        type="url"
                        value={form.website}
                        onChange={handleChange('website')}
                        placeholder="https://company.com"
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={form.address}
                        onChange={handleChange('address')}
                        placeholder="123 Market Street, Suite 400, Commerce City, CA"
                        className="mt-1 block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Display Settings Tab */}
            {activeTab === 'display' && (
              <div className="space-y-8 animate-fadeIn">
                <header>
                  <h2 className="text-2xl font-semibold text-gray-900">Display Settings</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Control how your products and catalog are displayed to visitors.
                  </p>
                </header>

                <section>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Visibility</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label htmlFor="showPrices" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Show Prices on Products
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          When enabled, product prices will be visible to all visitors on the catalog and product detail pages.
                          Disable this if you want to hide pricing information from public view (useful for B2B catalogs or quote-based sales).
                        </p>
                      </div>
                      <div className="ml-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="showPrices"
                            type="checkbox"
                            checked={form.showPrices}
                            onChange={handleToggle('showPrices')}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">When to hide prices?</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• B2B catalogs where pricing is negotiated per customer</li>
                          <li>• Quote-based sales requiring customer consultation</li>
                          <li>• Exclusive or luxury products with private pricing</li>
                          <li>• Market research or product showcases</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
                {warningMessage && !errorMessage && <p className="text-sm text-amber-600">{warningMessage}</p>}
                {errorMessage && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                    {warningMessage && <p className="text-xs text-amber-600">{warningMessage}</p>}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm(DEFAULT_COMPANY_PROFILE)}
                  className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset to Defaults
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
