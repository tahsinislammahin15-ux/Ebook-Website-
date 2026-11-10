import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ebook, StoreSettings, SiteLanguage } from '../types/ebook';
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
        // Force updated credentials requested by user
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          storeName: "KitabGhar",
          storeNameBn: "কিতাবঘর (KitabGhar)",
          storeTagline: "Your Ultimate Book Home",
          storeTaglineBn: "আপনার বইয়ের নির্ভরযোগ্য ঠিকানা (Your Ultimate Book Home)",
          logoUrl: "/assets/aistudio/1794301559714_e54adc4f.jpg",
          whatsappNumber: "8801700968369",
          whatsappDisplayNumber: "+880 1700-968369",
          bkashNumber: "01712-455726",
          nagadNumber: "01700-968369",
          adminUsername: "tahsinislam",
          adminPasscode: "tahsinislam4567"
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

    const content = `=====================================================
${title.toUpperCase()}
=====================================================
${language === 'bn' ? 'লেখক' : 'Author'}: ${author}
${language === 'bn' ? 'ক্যাটেগরি' : 'Category'}: ${book.category}
${language === 'bn' ? 'পৃষ্ঠা সংখ্যা' : 'Pages'}: ${book.pages}
${language === 'bn' ? 'ভাষা' : 'Language'}: ${book.language}
${language === 'bn' ? 'ফরম্যাট' : 'Format'}: ${book.format}
${language === 'bn' ? 'পরিবেশক' : 'Distributed by'}: ${language === 'bn' ? settings.storeNameBn : settings.storeName}
=====================================================

${language === 'bn' ? 'বই পরিচিতি:' : 'DESCRIPTION:'}
${desc}

${language === 'bn' ? 'সূচিপত্র:' : 'TABLE OF CONTENTS:'}
${toc.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n')}

=====================================================
${language === 'bn' ? 'নমুনা পাঠ ও নির্বাচিত অধ্যায়:' : 'EXCERPT & PREVIEW:'}
=====================================================

${excerpt}

=====================================================
${language === 'bn' 
  ? `বইটি ডাউনলোড করার জন্য ধন্যবাদ!\nহোয়াটসঅ্যাপ হেল্পলাইন: ${settings.whatsappDisplayNumber}`
  : `Thank you for downloading from ${settings.storeName}!\nWhatsApp Support: ${settings.whatsappDisplayNumber}`}
=====================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')}_KitabGhor.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
