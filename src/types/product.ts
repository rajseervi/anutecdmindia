import { CompanyProfile } from './company';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  qrCode: string; // URL or data for QR
  inventory: number;
  category?: string; // Product category for filtering/searching
  hidden?: boolean; // Whether the product is hidden from the catalog
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: string[];
  company?: CompanyProfile;
  error?: string;
  details?: string;
}
