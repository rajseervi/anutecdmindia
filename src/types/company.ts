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
  name: 'Anutec',
  tagline: 'Precision-Engineered Taps & Faucets',
  description: 'Anutec is a leading Indian manufacturer of high-quality bathroom taps, faucets, and accessories — combining precision engineering with elegant design for lasting performance.',
  email: 'info@anutec.in',
  phone: '0000000000',
  website: 'https://www.anutecdmindia.com/',
  address: 'Anutec Manufacturing Facility, Hyderabad, India',
  showPrices: false,
};
