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

export interface FlashSaleConfig {
  enabled: boolean;
  badgeBn: string;
  badgeEn: string;
  textBn: string;
  textEn: string;
  promoCode: string;
}

export interface AuthorStoryConfig {
  enabled: boolean;
  founderName: string;
  founderNameBn: string;
  founderRole: string;
  founderRoleBn: string;
  headline: string;
  headlineBn: string;
  bio: string;
  bioBn: string;
}

export interface FAQEntry {
  id: string;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
}

export interface LiveSaleItem {
  id: string;
  buyerName: string;
  buyerNameBn: string;
  district: string;
  districtBn: string;
  bookTitle: string;
  bookTitleBn: string;
  timeAgo: string;
  timeAgoBn: string;
  bookId?: string;
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
  seo?: SEOSettings;
  coupons?: Coupon[];
  flashSale?: FlashSaleConfig;
  authorStory?: AuthorStoryConfig;
  bundles?: ComboBundle[];
  showBundlesSection?: boolean;
  faqs?: FAQEntry[];
  showFaqSection?: boolean;
  liveSales?: LiveSaleItem[];
  showLiveSalesPopup?: boolean;
  showReviewsSection?: boolean;
  downloadGiftCouponCode?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed'; // percentage (%) or flat BDT
  discountValue: number; // e.g. 20 for 20% or 50 for 50 BDT
  minSpend?: number;
  description?: string;
  descriptionBn?: string;
  isActive: boolean;
}

export interface SEOSettings {
  metaTitle: string;
  metaTitleBn: string;
  metaDescription: string;
  metaDescriptionBn: string;
  ogTitle: string;
  ogTitleBn?: string;
  ogDescription: string;
  ogDescriptionBn?: string;
  ogImage: string;
  keywords: string;
  author: string;
  canonicalUrl?: string;
  twitterHandle?: string;
  siteName?: string;
}

export type SiteLanguage = 'bn' | 'en';

export interface ReadingProgress {
  bookId: string;
  bookTitle: string;
  bookTitleBn?: string;
  currentPage: number;
  totalPages: number;
  percent: number;
  lastReadAt: number;
}

export interface ComboBundle {
  id: string;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  bookIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  badge: string;
  badgeBn: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  avatar: string;
  rating: number;
  comment: string;
  commentBn: string;
  bookTitle: string;
  bookTitleBn: string;
  verified: boolean;
  date: string;
}

