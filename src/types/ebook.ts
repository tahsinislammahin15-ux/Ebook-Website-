export type EbookType = 'free' | 'paid';

export interface Ebook {
  id: string;
  title: string;
  titleBn?: string;
  author: string;
  authorBn?: string;
  category: 'Programming' | 'Business' | 'Freelancing' | 'Design' | 'Self-Help' | 'Fiction' | string;
  categoryBn?: string;
  type: EbookType;
  price: number; // in BDT, 0 if free
  originalPrice?: number;
  currency: string;
  rating: number;
  pages: number;
  language: string;
  format: string; // e.g., "PDF + EPUB"
  coverImage: string;
  shortDescription: string;
  shortDescriptionBn?: string;
  description: string;
  descriptionBn?: string;
  previewExcerpt: string;
  previewExcerptBn?: string;
  tableOfContents: string[];
  tableOfContentsBn?: string[];
  downloadUrl?: string; // For free download or paid delivery link
  fileSize: string; // e.g. "12.4 MB"
  featured?: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn: string;
  storeTagline: string;
  storeTaglineBn: string;
  logoUrl?: string;
  whatsappNumber: string; // "8801700968369"
  whatsappDisplayNumber: string; // "+880 1700-968369"
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant';
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  currencySymbol: string;
  adminUsername: string; // e.g. "tahsinislam"
  adminPasscode: string;
}

export type SiteLanguage = 'bn' | 'en';
