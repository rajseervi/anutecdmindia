export interface CompanyProfile {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  showPrices: boolean;
}

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'Diamond Marketing',
  tagline: 'Anutec Taps — Precision-Engineered Faucets & Accessories',
  description: 'Diamond Marketing And Product Manufacturing is a leading Indian manufacturer of Anutec Taps — high-quality bathroom faucets, kitchen taps, shower mixers, and accessories combining precision engineering with elegant design for lasting performance.',
  email: 'info@anutec.in',
  phone: '0000000000',
  website: 'https://www.anutecdmindia.com/',
  address: 'Diamond Marketing And Product Manufacturing, Hyderabad, India',
  showPrices: false,
};
