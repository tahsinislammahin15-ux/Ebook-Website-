import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ebook, StoreSettings, SiteLanguage, Coupon, ReadingProgress, CustomerReview } from '../types/ebook';
import { DEFAULT_EBOOKS, DEFAULT_STORE_SETTINGS } from '../data/defaultProducts';
import { TRANSLATIONS } from '../data/translations';

interface StoreContextType {
  ebooks: Ebook[];
  settings: StoreSettings;
  language: SiteLanguage;
  setLanguage: (lang: SiteLanguage) => void;
  toggleLanguage: () => void;
  t: typeof TRANSLATIONS['bn'];
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeReaderBook: Ebook | null;
  openReader: (book: Ebook) => void;
  closeReader: () => void;
  activeCheckoutBook: Ebook | null;
  openCheckout: (book: Ebook) => void;
  closeCheckout: () => void;
  isAdminOpen: boolean;
  openAdmin: () => void;
  closeAdmin: () => void;
  wishlist: string[];
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;
  clearWishlist: () => void;
  addEbook: (book: Omit<Ebook, 'id'>) => void;
  updateEbook: (id: string, book: Partial<Ebook>) => void;
  deleteEbook: (id: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  exportProductsJSON: () => void;
  resetCatalog: () => void;
  generateEbookDownload: (book: Ebook) => void;
  coupons: Coupon[];
  activeCoupon: Coupon | null;
  applyCoupon: (code: string, currentPrice?: number) => { success: boolean; message: string; discountAmount: number };
  removeCoupon: () => void;
  addCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;
  toggleCoupon: (code: string) => void;
  readingProgress: Record<string, ReadingProgress>;
  updateReadingProgress: (bookId: string, page: number, totalPages: number) => void;
  lastReadBook: ReadingProgress | null;
  downloadGiftModalBook: Ebook | null;
  closeDownloadGiftModal: () => void;
  reviews: CustomerReview[];
  addReview: (rev: CustomerReview) => void;
  deleteReview: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PRODUCTS = 'kitabghor_custom_products_v2';
const LOCAL_STORAGE_KEY_SETTINGS = 'kitabghor_store_settings_v2';
const LOCAL_STORAGE_KEY_THEME = 'kitabghor_theme';
const LOCAL_STORAGE_KEY_LANG = 'kitabghor_language';
const LOCAL_STORAGE_KEY_WISHLIST = 'kitabghor_wishlist';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ebooks, setEbooks] = useState<Ebook[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_EBOOKS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [language, setLanguageState] = useState<SiteLanguage>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LANG);
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {
      // default
    }
    return 'bn'; // Default to Bangla for Bangladeshi audience
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [activeReaderBook, setActiveReaderBook] = useState<Ebook | null>(null);
  const [activeCheckoutBook, setActiveCheckoutBook] = useState<Ebook | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_WISHLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    return settings.coupons || DEFAULT_STORE_SETTINGS.coupons || [];
  });
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  // Reading progress tracking (per book)
  const LOCAL_STORAGE_KEY_PROGRESS = 'kitabghor_reading_progress';
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  const updateReadingProgress = (bookId: string, page: number, totalPages: number) => {
    const book = ebooks.find(b => b.id === bookId);
    if (!book) return;
    const percent = Math.min(100, Math.round((page / Math.max(1, totalPages)) * 100));
    setReadingProgress(prev => {
      const updated: Record<string, ReadingProgress> = {
        ...prev,
        [bookId]: {
          bookId,
          bookTitle: book.title,
          bookTitleBn: book.titleBn,
          currentPage: page,
          totalPages,
          percent,
          lastReadAt: Date.now()
        }
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      return updated;
    });
  };

  // Derive most recently read book
  const lastReadBook = React.useMemo(() => {
    const entries = Object.values(readingProgress);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b.lastReadAt - a.lastReadAt);
    return entries[0];
  }, [readingProgress]);

  // Download Gift Confetti & Bonus Coupon Modal
  const [downloadGiftModalBook, setDownloadGiftModalBook] = useState<Ebook | null>(null);
  const closeDownloadGiftModal = () => setDownloadGiftModalBook(null);

  // Customer Reviews State
  const LOCAL_STORAGE_KEY_REVIEWS = 'kitabghor_customer_reviews';
  const INITIAL_REVIEWS: CustomerReview[] = [
    {
      id: 'rev-1',
      name: 'Hasibul Islam',
      nameBn: 'হাসিবুল ইসলাম',
      role: 'Junior Software Engineer',
      roleBn: 'জুনিয়র সফটওয়্যার ইঞ্জিনিয়ার',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Python & AI Mastery e-book helped me land my first tech internship. The Bengali explanations of complex concepts were exceptionally clear!',
      commentBn: 'পাইথন ও এআই বইটি পড়ে আমি অনেক কিছু সহজভাবে শিখতে পেরেছি। বাংলা ভাষায় এত সুন্দর ও আধুনিক হ্যান্ডস-অন গাইড আসলেই বিরল!',
      bookTitle: 'Python & AI Mastery',
      bookTitleBn: 'পাইথন ও এআই মাস্টারি',
      verified: true,
      date: '3 days ago'
    },
    {
      id: 'rev-2',
      name: 'Tania Akter',
      nameBn: 'তানিয়া আক্তার',
      role: 'Fiverr & Upwork Top Freelancer',
      roleBn: 'আপওয়ার্ক ও ফাইভার ফ্রিল্যান্সার',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Purchased Bangla Freelancing Playbook via bKash. Got the Google Drive link on WhatsApp within 4 minutes! Outstanding service.',
      commentBn: 'বিকাশ দিয়ে অর্ডার করার মাত্র ৪ মিনিটের মধ্যেই হোয়াটসঅ্যাপে গুগল ড্রাইভের ফুল ডাউনলোড লিংক পেয়েছি। সার্ভিস অসাধারণ!',
      bookTitle: 'Bangla Freelancing Playbook',
      bookTitleBn: 'বাংলা ফ্রিল্যান্সিং প্লেবুক',
      verified: true,
      date: '1 week ago'
    },
    {
      id: 'rev-3',
      name: 'Mehedi Hasan Rifat',
      nameBn: 'মেহেদী হাসান রিফাত',
      role: 'Computer Science Student, RUET',
      roleBn: 'সিএসই শিক্ষার্থী, রুয়েট',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Downloaded the free Modern Web Architecture sample excerpt first. Loved the quality and immediately bought the complete version!',
      commentBn: 'প্রথমে ওয়েবসাইটের রিডার দিয়ে ফ্রিতে নমুনা অংশ পড়েছিলাম। কোয়ালিটি দেখে মুগ্ধ হয়ে সাথে সাথেই পুরো বইটি অর্ডার করেছি।',
      bookTitle: 'Modern Web Architecture',
      bookTitleBn: 'মডার্ন ওয়েব আর্কিটেকচার',
      verified: true,
      date: '2 weeks ago'
    }
  ];

  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  const addReview = (rev: CustomerReview) => {
    setReviews(prev => {
      const next = [rev, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY_REVIEWS, JSON.stringify(next));
      return next;
    });
  };

  const deleteReview = (id: string) => {
    setReviews(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY_REVIEWS, JSON.stringify(next));
      return next;
    });
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const toggleWishlist = (bookId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(bookId);
      const next = exists ? prev.filter(id => id !== bookId) : [...prev, bookId];
      localStorage.setItem(LOCAL_STORAGE_KEY_WISHLIST, JSON.stringify(next));
      return next;
    });
  };

  const isInWishlist = (bookId: string) => wishlist.includes(bookId);

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY_WISHLIST);
  };

  // Sync theme with HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [darkMode]);

  // Sync language with storage
  const setLanguage = (lang: SiteLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LOCAL_STORAGE_KEY_LANG, lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const t = TRANSLATIONS[language];

  // Fetch products.json if no local overrides exist
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const hasLocal = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
        if (!hasLocal) {
          const res = await fetch('/products.json');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setEbooks(data);
            }
          }
        }
      } catch {
        // use default fallback
      }
    };
    fetchLiveProducts();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const openReader = (book: Ebook) => setActiveReaderBook(book);
  const closeReader = () => setActiveReaderBook(null);

  const openCheckout = (book: Ebook) => setActiveCheckoutBook(book);
  const closeCheckout = () => setActiveCheckoutBook(null);

  const openAdmin = () => setIsAdminOpen(true);
  const closeAdmin = () => setIsAdminOpen(false);

  const addEbook = (newBookData: Omit<Ebook, 'id'>) => {
    const newBook: Ebook = {
      ...newBookData,
      id: `ebook-${Date.now()}`
    };
    setEbooks(prev => {
      const next = [newBook, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const updateEbook = (id: string, updated: Partial<Ebook>) => {
    setEbooks(prev => {
      const next = prev.map(book => (book.id === id ? { ...book, ...updated } : book));
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const deleteEbook = (id: string) => {
    setEbooks(prev => {
      const next = prev.filter(book => book.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(next));
      return next;
    });
  };

  const exportProductsJSON = () => {
    const jsonStr = JSON.stringify(ebooks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetCatalog = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PRODUCTS);
    setEbooks(DEFAULT_EBOOKS);
  };

  const applyCoupon = (code: string, currentPrice = 0) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      return {
        success: false,
        message: language === 'bn' ? 'অকার্যকর বা মেয়াদোত্তীর্ণ কুপন কোড' : 'Invalid or expired coupon code',
        discountAmount: 0
      };
    }
    if (found.minSpend && currentPrice < found.minSpend) {
      return {
        success: false,
        message: language === 'bn' 
          ? `এই কুপনের জন্য সর্বনিম্ন ৳${found.minSpend} টাকার বই অর্ডার প্রয়োজন` 
          : `Minimum spend of ৳${found.minSpend} required for this coupon`,
        discountAmount: 0
      };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = Math.round((currentPrice * found.discountValue) / 100);
    } else {
      discount = Math.min(found.discountValue, currentPrice);
    }

    setActiveCoupon(found);
    return {
      success: true,
      message: language === 'bn' 
        ? `${found.code} কোড প্রয়োগ হয়েছে! (৳${discount} ছাড়)` 
        : `Coupon ${found.code} applied! (Saved ৳${discount})`,
      discountAmount: discount
    };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => {
      const filtered = prev.filter(c => c.code.toUpperCase() !== newCoupon.code.toUpperCase());
      const next = [newCoupon, ...filtered];
      updateSettings({ coupons: next });
      return next;
    });
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => {
      const next = prev.filter(c => c.code.toUpperCase() !== code.toUpperCase());
      updateSettings({ coupons: next });
      return next;
    });
  };

  const toggleCoupon = (code: string) => {
    setCoupons(prev => {
      const next = prev.map(c => (c.code.toUpperCase() === code.toUpperCase() ? { ...c, isActive: !c.isActive } : c));
      updateSettings({ coupons: next });
      return next;
    });
  };

  // Direct free ebook downloader
  const generateEbookDownload = (book: Ebook) => {
    if (book.downloadUrl && book.downloadUrl !== '#' && book.downloadUrl.trim() !== '') {
      const a = document.createElement('a');
      a.href = book.downloadUrl;
      a.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const title = language === 'bn' && book.titleBn ? book.titleBn : book.title;
    const author = language === 'bn' && book.authorBn ? book.authorBn : book.author;
    const desc = language === 'bn' && book.descriptionBn ? book.descriptionBn : book.description;
    const excerpt = language === 'bn' && book.previewExcerptBn ? book.previewExcerptBn : book.previewExcerpt;
    const toc = language === 'bn' && book.tableOfContentsBn ? book.tableOfContentsBn : book.tableOfContents;

    const htmlDocument = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <title>${title} - ${settings.storeName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", "Noto Sans Bengali", sans-serif;
      line-height: 1.7;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
      background: #ffffff;
    }
    .cover-card {
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 36px;
      background: #f8fafc;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #10b981;
      color: #ffffff;
      font-weight: bold;
      font-size: 12px;
      border-radius: 999px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 8px 0; }
    .author { font-size: 15px; color: #64748b; margin-bottom: 20px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 20px;
      text-align: left;
      font-size: 13px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    .meta-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: bold; }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #10b981;
      padding-bottom: 6px;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .toc-list { list-style: none; padding: 0; }
    .toc-list li {
      padding: 8px 12px;
      margin-bottom: 6px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
    }
    .excerpt-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #10b981;
      border-radius: 8px;
      padding: 24px;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.8;
      color: #334155;
    }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .print-btn {
      display: block;
      margin: 0 auto 24px auto;
      padding: 10px 20px;
      background: #10b981;
      color: #ffffff;
      font-weight: bold;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">${language === 'bn' ? '🖨️ এই পেজটি সরাসরি PDF হিসেবে সেভ করুন' : '🖨️ Save as PDF / Print'}</button>
  <div class="cover-card">
    <span class="badge">${language === 'bn' ? 'ফ্রি ই-বুক সংস্করণ' : 'Free E-Book Edition'}</span>
    <h1>${title}</h1>
    <div class="author">${language === 'bn' ? 'লেখক:' : 'By'} ${author}</div>
    <div class="meta-grid">
      <div><div class="meta-label">${language === 'bn' ? 'ক্যাটেগরি' : 'Category'}</div><strong>${book.category}</strong></div>
      <div><div class="meta-label">${language === 'bn' ? 'পৃষ্ঠা' : 'Pages'}</div><strong>${book.pages}</strong></div>
      <div><div class="meta-label">${language === 'bn' ? 'ফরম্যাট' : 'Format'}</div><strong>PDF Reader Ready</strong></div>
    </div>
  </div>

  <div class="section-title">${language === 'bn' ? 'বই পরিচিতি' : 'About This Book'}</div>
  <p>${desc}</p>

  <div class="section-title">${language === 'bn' ? 'সূচিপত্র' : 'Table of Contents'}</div>
  <ul class="toc-list">
    ${toc.map((c, i) => `<li>${i + 1}. ${c}</li>`).join('')}
  </ul>

  <div class="section-title">${language === 'bn' ? 'নমুনা পাঠ ও নির্বাচিত অধ্যায়' : 'Selected Sample Chapters'}</div>
  <div class="excerpt-box">${excerpt}</div>

  <div class="footer">
    <p><strong>${language === 'bn' ? settings.storeNameBn : settings.storeName}</strong> - ${language === 'bn' ? settings.storeTaglineBn : settings.storeTagline}</p>
    <p>WhatsApp Support: ${settings.whatsappDisplayNumber}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')}_KitabGhar.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Trigger instant celebratory confetti & gift modal
    setDownloadGiftModalBook(book);
  };

  return (
    <StoreContext.Provider
      value={{
        ebooks,
        settings,
        language,
        setLanguage,
        toggleLanguage,
        t,
        darkMode,
        toggleDarkMode,
        activeReaderBook,
        openReader,
        closeReader,
        activeCheckoutBook,
        openCheckout,
        closeCheckout,
        isAdminOpen,
        openAdmin,
        closeAdmin,
        wishlist,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        addEbook,
        updateEbook,
        deleteEbook,
        updateSettings,
        exportProductsJSON,
        resetCatalog,
        generateEbookDownload,
        coupons,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        toggleCoupon,
        readingProgress,
        updateReadingProgress,
        lastReadBook,
        downloadGiftModalBook,
        closeDownloadGiftModal,
        reviews,
        addReview,
        deleteReview
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
