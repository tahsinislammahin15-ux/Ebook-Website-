import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Ebook, SEOSettings, ComboBundle, FAQEntry, LiveSaleItem } from '../types/ebook';
import { DEFAULT_STORE_SETTINGS } from '../data/defaultProducts';
import { 
  X, Shield, Lock, Plus, Edit2, Trash2, Download, Save, 
  RotateCcw, Check, AlertCircle, FileCode, Smartphone, BookOpen, Layers,
  LogOut, Eye, EyeOff, User, KeyRound, Clock, Globe, Share2, Sparkles, Copy, CheckCheck, Tag,
  Sliders, HelpCircle, Star, ShoppingBag, Gift, UserCheck
} from 'lucide-react';

import {
  verifyOwnerCredentials,
  createAdminSession,
  hasValidAdminSession,
  clearAdminSession,
  computeSaltedHash,
  escapeHtml,
  sanitizeUrl
} from '../utils/security';

const LOCKOUT_KEY = 'kitabghor_admin_lockout_v3';
const ATTEMPTS_KEY = 'kitabghor_admin_failed_attempts_v3';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export const AdminModal: React.FC = () => {
  const { 
    isAdminOpen, closeAdmin, ebooks, settings, 
    addEbook, updateEbook, deleteEbook, updateSettings, 
    exportProductsJSON, resetCatalog, resetAllSettings,
    exportFullStoreBackupJSON, importFullStoreBackupJSON,
    language,
    coupons, addCoupon, deleteCoupon, toggleCoupon,
    reviews, addReview, updateReview, deleteReview
  } = useStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  
  // Rate limiting & lockout state (persisted in localStorage so opening a new tab cannot bypass lockout)
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(ATTEMPTS_KEY) || sessionStorage.getItem(ATTEMPTS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Cryptographically signed session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return hasValidAdminSession(settings.adminPasscodeHash);
  });

  const [activeTab, setActiveTab] = useState<'books' | 'sections' | 'bundles_faq' | 'coupons' | 'settings' | 'seo' | 'cpanel'>('books');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state for book add/edit
  const [bookForm, setBookForm] = useState<Partial<Ebook>>({
    title: '',
    titleBn: '',
    author: '',
    authorBn: '',
    category: 'Programming',
    categoryBn: 'প্রোগ্রামিং',
    type: 'paid',
    price: 350,
    originalPrice: 500,
    currency: 'BDT',
    pages: 200,
    language: 'English + বাংলা',
    format: 'PDF + EPUB',
    coverImage: '',
    shortDescription: '',
    shortDescriptionBn: '',
    description: '',
    descriptionBn: '',
    previewExcerpt: '',
    previewExcerptBn: '',
    tableOfContents: ['01. Introduction', '02. Core Principles', '03. Advanced Practice'],
    tableOfContentsBn: ['০১. ভূমিকা', '০২. মূলনীতি', '০৩. প্র্যাক্টিক্যাল অনুশীলন'],
    downloadUrl: '',
    fileSize: '10.5 MB',
    rating: 4.9,
    featured: false
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [seoForm, setSeoForm] = useState<SEOSettings>(() => {
    return settings.seo || DEFAULT_STORE_SETTINGS.seo || {
      metaTitle: "KitabGhar - Digital E-Book Store | Free & Paid E-Books",
      metaTitleBn: "কিতাবঘর - ডিজিটাল ই-বুক স্টোর ও হোয়াটসঅ্যাপ অর্ডার",
      metaDescription: "Download free curated e-books or buy premium guides with instant WhatsApp ordering and bKash/Nagad verification in Bangladesh.",
      metaDescriptionBn: "ফ্রি ও পেইড বাংলা-ইংরেজি ই-বুক ডাউনলোড করুন। বিকাশ ও নগদ পেমেন্ট ভেরিফিকেশন সহ হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন।",
      ogTitle: "KitabGhar - Your Ultimate Book Home",
      ogTitleBn: "কিতাবঘর - আপনার বইয়ের নির্ভরযোগ্য ঠিকানা",
      ogDescription: "Discover high-impact programming, freelancing, and business e-books. Instant free downloads and 1-click WhatsApp checkout.",
      ogDescriptionBn: "প্রোগ্রামিং, ফ্রিল্যান্সিং ও ক্যারিয়ার বিষয়ক সেরা ই-বুক সংগ্রহ। ফ্রি ডাউনলোড এবং বিকাশ ও নগদে সহজ হোয়াটসঅ্যাপ অর্ডার।",
      ogImage: "/assets/aistudio/1794301559714_e54adc4f.jpg",
      keywords: "kitabghar, bangla ebook, free ebook download, pdf download bangladesh, bkash payment, nagad payment, programming books, freelancing bangla, startup playbook, কিতাবঘর, বাংলা বই",
      author: "Tahsin Islam",
      canonicalUrl: "",
      twitterHandle: "@kitabghar",
      siteName: "KitabGhar"
    };
  });
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [autoOptimizedNotice, setAutoOptimizedNotice] = useState(false);

  // New coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(20);
  const [newMinSpend, setNewMinSpend] = useState<number>(0);
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New / Edit Bundle form state
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [bundleNameBn, setBundleNameBn] = useState('');
  const [bundleNameEn, setBundleNameEn] = useState('');
  const [bundleTaglineBn, setBundleTaglineBn] = useState('');
  const [bundlePrice, setBundlePrice] = useState<number>(450);
  const [bundleOrigPrice, setBundleOrigPrice] = useState<number>(700);
  const [bundleBadgeBn, setBundleBadgeBn] = useState('স্পেশাল কম্বো অফার');
  const [selectedBundleBooks, setSelectedBundleBooks] = useState<string[]>([]);

  // New / Edit FAQ form state
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQBn, setFaqQBn] = useState('');
  const [faqQEn, setFaqQEn] = useState('');
  const [faqABn, setFaqABn] = useState('');
  const [faqAEn, setFaqAEn] = useState('');

  // New / Edit Live Sale form state
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [saleBuyerBn, setSaleBuyerBn] = useState('');
  const [saleDistrictBn, setSaleDistrictBn] = useState('');
  const [saleBookBn, setSaleBookBn] = useState('');
  const [saleTimeBn, setSaleTimeBn] = useState('৫ মিনিট আগে');

  // New / Edit Admin Review form state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [revNameBn, setRevNameBn] = useState('');
  const [revRoleBn, setRevRoleBn] = useState('যাচাইকৃত পাঠক');
  const [revBookBn, setRevBookBn] = useState('পাইথন ও এআই মাস্টারি');
  const [revCommentBn, setRevCommentBn] = useState('');
  const [revRating, setRevRating] = useState<number>(5);

  // Real-time auto-save helpers so the owner never has to re-enter data or refresh the browser
  const handleLiveSettingChange = (patch: Partial<typeof settingsForm>) => {
    const next = { ...settingsForm, ...patch };
    setSettingsForm(next);
    updateSettings(patch);
  };

  const handleLiveSeoChange = (patch: Partial<SEOSettings>) => {
    const next = { ...seoForm, ...patch };
    setSeoForm(next);
    updateSettings({ seo: next });
  };

  useEffect(() => {
    setSettingsForm(settings);
    if (settings.seo) {
      setSeoForm(settings.seo);
    }
  }, [settings]);

  // Lockout countdown timer (checked across localStorage & sessionStorage)
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = localStorage.getItem(LOCKOUT_KEY) || sessionStorage.getItem(LOCKOUT_KEY);
        if (lockoutUntil) {
          const diff = parseInt(lockoutUntil, 10) - Date.now();
          if (diff > 0) {
            setLockoutRemaining(Math.ceil(diff / 1000));
          } else {
            setLockoutRemaining(0);
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            sessionStorage.removeItem(LOCKOUT_KEY);
            sessionStorage.removeItem(ATTEMPTS_KEY);
            setFailedAttempts(0);
          }
        }
      } catch {
        // ignore
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdminOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    const isVerified = verifyOwnerCredentials(
      usernameInput,
      passcodeInput,
      settings.adminUsernameHash,
      settings.adminPasscodeHash
    );

    if (isVerified) {
      createAdminSession(settings.adminPasscodeHash);
      setIsAuthenticated(true);
      setAuthError('');
      setFailedAttempts(0);
      setUsernameInput('');
      setPasscodeInput('');
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      sessionStorage.removeItem(ATTEMPTS_KEY);
      sessionStorage.removeItem(LOCKOUT_KEY);
      window.dispatchEvent(new CustomEvent('kitabghar:admin-auth-changed'));
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      localStorage.setItem(ATTEMPTS_KEY, nextAttempts.toString());
      sessionStorage.setItem(ATTEMPTS_KEY, nextAttempts.toString());

      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(LOCKOUT_KEY, lockoutTime.toString());
        sessionStorage.setItem(LOCKOUT_KEY, lockoutTime.toString());
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setAuthError(
          language === 'bn'
            ? '৩টি ভুল চেষ্টা হয়েছে। নিরাপত্তার স্বার্থে ৩ মিনিটের জন্য অ্যাকাউন্ট লক করা হয়েছে।'
            : '3 failed attempts. Account temporarily locked for 3 minutes for security.'
        );
      } else {
        const remaining = MAX_ATTEMPTS - nextAttempts;
        setAuthError(
          language === 'bn'
            ? `ব্যবহারকারীর নাম বা পাসওয়ার্ড ভুল হয়েছে। আর ${remaining}টি সুযোগ বাকি আছে।`
            : `Incorrect username or password. ${remaining} attempt(s) remaining.`
        );
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    clearAdminSession();
    setUsernameInput('');
    setPasscodeInput('');
    window.dispatchEvent(new CustomEvent('kitabghar:admin-auth-changed'));
    closeAdmin();
  };

  const handleStartEdit = (book: Ebook) => {
    setEditingBookId(book.id);
    setIsAddingNew(false);
    setBookForm(book);
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingBookId(null);
    setBookForm({
      title: '',
      titleBn: '',
      author: '',
      authorBn: '',
      category: 'Programming',
      categoryBn: 'প্রোগ্রামিং',
      type: 'free',
      price: 0,
      originalPrice: 0,
      currency: 'BDT',
      pages: 150,
      language: 'English + বাংলা',
      format: 'PDF',
      coverImage: '/src/assets/images/book_cover_web_dev_1794299826686.jpg',
      shortDescription: '',
      shortDescriptionBn: '',
      description: '',
      descriptionBn: '',
      previewExcerpt: 'Chapter 1: Getting Started\n\nWelcome to this publication...',
      previewExcerptBn: '১ম অধ্যায়: শুরু করা\n\nএই বইটিতে স্বাগতম...',
      tableOfContents: ['01. Introduction', '02. First Principles', '03. Practice'],
      tableOfContentsBn: ['০১. পরিচিতি', '০২. মূল ধারণা', '০৩. অনুশীলন'],
      downloadUrl: '',
      fileSize: '8.5 MB',
      rating: 4.8,
      featured: false
    });
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title && !bookForm.titleBn) {
      return;
    }

    const payload: Omit<Ebook, 'id'> = {
      title: bookForm.title || bookForm.titleBn || 'Untitled Ebook',
      titleBn: bookForm.titleBn || bookForm.title,
      author: bookForm.author || 'Anonymous',
      authorBn: bookForm.authorBn || bookForm.author,
      category: bookForm.category || 'General',
      categoryBn: bookForm.categoryBn || bookForm.category,
      type: (bookForm.type as 'free' | 'paid') || 'paid',
      price: Number(bookForm.price) || 0,
      originalPrice: bookForm.originalPrice ? Number(bookForm.originalPrice) : undefined,
      currency: 'BDT',
      rating: Number(bookForm.rating) || 4.9,
      pages: Number(bookForm.pages) || 100,
      language: bookForm.language || 'English + বাংলা',
      format: bookForm.format || 'PDF',
      coverImage: bookForm.coverImage || '/src/assets/images/book_cover_web_dev_1794299826686.jpg',
      shortDescription: bookForm.shortDescription || '',
      shortDescriptionBn: bookForm.shortDescriptionBn || bookForm.shortDescription,
      description: bookForm.description || '',
      descriptionBn: bookForm.descriptionBn || bookForm.description,
      previewExcerpt: bookForm.previewExcerpt || '',
      previewExcerptBn: bookForm.previewExcerptBn || bookForm.previewExcerpt,
      tableOfContents: Array.isArray(bookForm.tableOfContents) ? bookForm.tableOfContents : ['01. Introduction'],
      tableOfContentsBn: Array.isArray(bookForm.tableOfContentsBn) ? bookForm.tableOfContentsBn : ['০১. ভূমিকা'],
      downloadUrl: bookForm.downloadUrl || '',
      fileSize: bookForm.fileSize || '10 MB',
      featured: Boolean(bookForm.featured)
    };

    if (isAddingNew) {
      addEbook(payload);
    } else if (editingBookId) {
      updateEbook(editingBookId, payload);
    }

    setIsAddingNew(false);
    setEditingBookId(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ seo: seoForm });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAutoOptimizeSEO = () => {
    const freeCount = ebooks.filter(b => b.type === 'free').length;
    const paidCount = ebooks.filter(b => b.type === 'paid').length;
    const store = settings.storeName || 'KitabGhar';
    const storeBn = settings.storeNameBn || 'কিতাবঘর';

    const optimized: SEOSettings = {
      ...seoForm,
      metaTitle: `${store} - Best Digital E-Book Store in Bangladesh | Free & Paid PDF`,
      metaTitleBn: `${storeBn} - বাংলাদেশের সেরা ই-বুক স্টোর | ফ্রি ও পেইড বই`,
      metaDescription: `Explore ${ebooks.length}+ curated e-books on ${store}. ${freeCount} free direct downloads and ${paidCount} premium guides with instant WhatsApp ordering and bKash/Nagad verification in BDT.`,
      metaDescriptionBn: `${storeBn}-এ রয়েছে ${ebooks.length}+ টি সেরা ই-বুক। ${freeCount}টি ফ্রি বই সরাসরি ডাউনলোড করুন এবং ${paidCount}টি প্রিমিয়াম বই বিকাশ ও নগদে হোয়াটসঅ্যাপে অর্ডার করুন।`,
      ogTitle: `${store} - Your Ultimate E-Book Home in Bangladesh`,
      ogTitleBn: `${storeBn} - আপনার নির্ভরযোগ্য ডিজিটাল বইয়ের ঠিকানা`,
      ogDescription: `Instant PDF downloads and WhatsApp mobile banking checkout for programming, freelancing, and business guides.`,
      ogDescriptionBn: `প্রোগ্রামিং, ফ্রিল্যান্সিং ও ক্যারিয়ারের সেরা বই পড়ুন। ফ্রি ডাউনলোড এবং বিকাশ ও নগদে সহজ হোয়াটসঅ্যাপ অর্ডার।`,
      keywords: `${store.toLowerCase()}, bangla ebook, pdf download bd, bkash payment ebook, freelancing bangla pdf, programming book bangla, kitabghar e-book, কিতাবঘর, ফ্রি বই ডাউনলোড`,
      author: seoForm.author || "Tahsin Islam",
      siteName: store
    };

    setSeoForm(optimized);
    updateSettings({ seo: optimized });
    setAutoOptimizedNotice(true);
    setTimeout(() => setAutoOptimizedNotice(false), 3000);
  };

  const generateStaticHTMLSnippet = () => {
    const isBn = language === 'bn';
    const activeTitle = escapeHtml((isBn ? (seoForm.metaTitleBn || seoForm.metaTitle) : seoForm.metaTitle) || 'KitabGhar - Digital E-Book Store');
    const activeDesc = escapeHtml((isBn ? (seoForm.metaDescriptionBn || seoForm.metaDescription) : seoForm.metaDescription) || '');
    const ogTitle = escapeHtml((isBn ? (seoForm.ogTitleBn || seoForm.ogTitle) : seoForm.ogTitle) || activeTitle);
    const ogDesc = escapeHtml((isBn ? (seoForm.ogDescriptionBn || seoForm.ogDescription) : seoForm.ogDescription) || activeDesc);
    const rawImage = escapeHtml(sanitizeUrl(seoForm.ogImage || settings.logoUrl, '/assets/aistudio/1794301559714_e54adc4f.jpg'));
    const canonical = escapeHtml(sanitizeUrl(seoForm.canonicalUrl, 'https://yourdomain.com'));
    const safeKeywords = escapeHtml(seoForm.keywords);
    const safeAuthor = escapeHtml(seoForm.author);
    const safeSiteName = escapeHtml(seoForm.siteName || settings.storeName);
    const safeTwitter = escapeHtml(seoForm.twitterHandle);

    return `<!-- KitabGhar Production SEO & OpenGraph Meta Tags -->
<title>${activeTitle}</title>
<meta name="description" content="${activeDesc}" />
<meta name="keywords" content="${safeKeywords}" />
<meta name="author" content="${safeAuthor}" />
<link rel="canonical" href="${canonical}" />

<!-- OpenGraph / Facebook / WhatsApp -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${ogTitle}" />
<meta property="og:description" content="${ogDesc}" />
<meta property="og:image" content="${rawImage}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:site_name" content="${safeSiteName}" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${ogTitle}" />
<meta name="twitter:description" content="${ogDesc}" />
<meta name="twitter:image" content="${rawImage}" />
${safeTwitter ? `<meta name="twitter:site" content="${safeTwitter}" />` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull/Drag Affordance Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-emerald-500" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'মালিকের সুরক্ষিত কন্ট্রোল প্যানেল' : 'Secure Owner Portal'}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold">
                  Protected
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn' 
                  ? 'শুধুমাত্র অনুমোদিত মালিকের জন্য সংরক্ষিত' 
                  : 'Restricted access for store owner only'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/50"
                title="Logout from admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            )}
            <button
              onClick={closeAdmin}
              aria-label="Close portal"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Security Authentication Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'মালিকানা যাচাইকরণ' : 'Owner Authentication'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'bn' 
                  ? 'অনুমোদিত এক্সেস নিশ্চিত করতে আপনার ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।' 
                  : 'Enter your owner username and secure password to unlock control.'}
              </p>
            </div>

            {/* Lockout Banner */}
            {lockoutRemaining > 0 ? (
              <div className="w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                  <Clock className="w-4 h-4 text-rose-500 animate-spin" />
                  <span>
                    {language === 'bn' ? 'অ্যাকাউন্ট সাময়িক লক করা হয়েছে' : 'Security Lockout Active'}
                  </span>
                </div>
                <p>
                  {language === 'bn' 
                    ? `অতিরিক্ত ভুল প্রচেষ্টার কারণে লক করা হয়েছে। অপেক্ষা করুন: ${lockoutRemaining} সেকেন্ড`
                    : `Too many failed attempts. Try again in: ${lockoutRemaining}s`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="w-full space-y-3.5 text-left">
                
                {/* Username Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইউজারনেম / ইমেইল' : 'Admin Username / Email'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder={language === 'bn' ? 'মালিকের ইউজারনেম দিন' : 'Enter owner username'}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'গোপন পাসওয়ার্ড' : 'Secure Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'নিরাপদ লগইন করুন' : 'Authenticate & Unlock'}
                </button>
              </form>
            )}

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>{language === 'bn' ? 'SHA-256 এনক্রিপ্টেড সুরক্ষা সক্রিয়। সর্বোচ্চ ৩টি প্রচেষ্টার সুযোগ দেওয়া হবে।' : 'SHA-256 Encrypted Protection Active. Max 3 attempts before lockout.'}</p>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1 py-2">
                <button
                  onClick={() => { setActiveTab('books'); setIsAddingNew(false); setEditingBookId(null); }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'books'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `ই-বুক (${ebooks.length})` : `E-Books (${ebooks.length})`}</span>
                </button>
                <button
                  onClick={() => setActiveTab('sections')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'sections'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সাইট কন্ট্রোল ও সেকশন' : 'Site Control & Sections'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('bundles_faq')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'bundles_faq'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বান্ডেল, FAQ ও রিভিউ' : 'Bundles, FAQ & Reviews'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'coupons'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? `কুপন (${coupons.length})` : `Coupons (${coupons.length})`}</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ওয়ালেট ও ব্র্যান্ড' : 'Wallets & Brand'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'seo'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'এসইও ও মেটা' : 'SEO & Social'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('cpanel')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'cpanel'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সিপ্যানেল এক্সপোর্ট' : 'cPanel Export'}</span>
                </button>
              </div>

              {/* 1-Click Export products.json button */}
              <button
                onClick={exportProductsJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
                title="Download products.json for cPanel hosting"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export products.json</span>
              </button>
            </div>

            {/* Notification Banner */}
            {saveSuccess && (
              <div className="mx-6 mt-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'bn' ? 'সফলভাবে সংরক্ষিত হয়েছে!' : 'Changes saved successfully to catalog and browser storage!'}</span>
              </div>
            )}

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* TAB 1: BOOKS MANAGER */}
              {activeTab === 'books' && (
                <div className="space-y-6">
                  
                  {/* Add New / Edit Book Form */}
                  {(isAddingNew || editingBookId) ? (
                    <form onSubmit={handleSaveBook} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {isAddingNew 
                            ? (language === 'bn' ? 'নতুন ই-বুক যোগ করুন' : 'Add New E-Book') 
                            : (language === 'bn' ? `সম্পাদনা: ${bookForm.titleBn || bookForm.title}` : `Editing: ${bookForm.title}`)}
                        </h4>
                        <button
                          type="button"
                          onClick={() => { setIsAddingNew(false); setEditingBookId(null); }}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Title (English) *</label>
                          <input
                            type="text"
                            required
                            value={bookForm.title || ''}
                            onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">বইয়ের নাম (বাংলা)</label>
                          <input
                            type="text"
                            value={bookForm.titleBn || ''}
                            onChange={(e) => setBookForm({ ...bookForm, titleBn: e.target.value })}
                            placeholder="যেমন: পাইথন ও মেশিন লার্নিং"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Author (English) *</label>
                          <input
                            type="text"
                            required
                            value={bookForm.author || ''}
                            onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">লেখকের নাম (বাংলা)</label>
                          <input
                            type="text"
                            value={bookForm.authorBn || ''}
                            onChange={(e) => setBookForm({ ...bookForm, authorBn: e.target.value })}
                            placeholder="যেমন: তাহসিন ইসলাম"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                            {language === 'bn' ? 'বইয়ের ধরন (ফ্রি নাকি পেইড) *' : 'Type (Free or Paid) *'}
                          </label>
                          <select
                            value={bookForm.type || 'paid'}
                            onChange={(e) => setBookForm({ ...bookForm, type: e.target.value as 'free' | 'paid', price: e.target.value === 'free' ? 0 : bookForm.price || 350 })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="free">{language === 'bn' ? 'ফ্রি (সরাসরি ডাউনলোড)' : 'Free (Direct Download)'}</option>
                            <option value="paid">{language === 'bn' ? 'পেইড (বিকাশ/হোয়াটসঅ্যাপ অর্ডার)' : 'Paid (WhatsApp Order with bKash)'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Category (ক্যাটেগরি)</label>
                          <input
                            type="text"
                            value={bookForm.category || ''}
                            onChange={(e) => setBookForm({ ...bookForm, category: e.target.value, categoryBn: e.target.value })}
                            placeholder="Programming, Business, Freelancing..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        {bookForm.type === 'paid' && (
                          <>
                            <div>
                              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Price ({settings.currencySymbol} BDT)</label>
                              <input
                                type="number"
                                value={bookForm.price ?? 0}
                                onChange={(e) => setBookForm({ ...bookForm, price: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Original Price ({settings.currencySymbol})</label>
                              <input
                                type="number"
                                value={bookForm.originalPrice ?? ''}
                                onChange={(e) => setBookForm({ ...bookForm, originalPrice: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Pages (পৃষ্ঠা সংখ্যা)</label>
                          <input
                            type="number"
                            value={bookForm.pages || 100}
                            onChange={(e) => setBookForm({ ...bookForm, pages: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Cover Image URL or Path</label>
                          <input
                            type="text"
                            value={bookForm.coverImage || ''}
                            onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                            placeholder="/src/assets/images/... or https://..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                            {language === 'bn' ? 'ই-বুক / PDF ফাইলের লিংক (Download URL)' : 'PDF Download URL / Link'}
                          </label>
                          <input
                            type="text"
                            value={bookForm.downloadUrl || ''}
                            onChange={(e) => setBookForm({ ...bookForm, downloadUrl: e.target.value })}
                            placeholder={language === 'bn' ? '/ebooks/my-book.pdf অথবা গুগল ড্রাইভ লিংক' : '/ebooks/my-book.pdf or Google Drive link'}
                            className="w-full px-3 py-2 rounded-lg border border-emerald-500/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {language === 'bn' 
                              ? 'cPanel-এর public_html/ebooks ফোল্ডারে PDF ফাইল রেখে এখানে /ebooks/বইয়ের-নাম.pdf দিন।' 
                              : 'Upload PDF to public_html/ebooks/ and put /ebooks/file.pdf here.'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs space-y-3">
                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Short Summary (সংক্ষিপ্ত বিবরণ)</label>
                          <input
                            type="text"
                            value={bookForm.shortDescriptionBn || bookForm.shortDescription || ''}
                            onChange={(e) => setBookForm({ ...bookForm, shortDescription: e.target.value, shortDescriptionBn: e.target.value })}
                            placeholder="কার্ডে প্রদর্শিত ১-২ লাইনের বিবরণ"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Detailed Description (বিস্তারিত বিবরণ)</label>
                          <textarea
                            rows={3}
                            value={bookForm.descriptionBn || bookForm.description || ''}
                            onChange={(e) => setBookForm({ ...bookForm, description: e.target.value, descriptionBn: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Sample Excerpt (নমুনা পড়ার অংশ)</label>
                          <textarea
                            rows={4}
                            value={bookForm.previewExcerptBn || bookForm.previewExcerpt || ''}
                            onChange={(e) => setBookForm({ ...bookForm, previewExcerpt: e.target.value, previewExcerptBn: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => { setIsAddingNew(false); setEditingBookId(null); }}
                          className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'ক্যাটালগে সেভ করুন' : 'Save to Catalog'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Books Table */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {language === 'bn' ? `বর্তমান ক্যাটালগ (${ebooks.length}টি বই)` : `Current Catalog (${ebooks.length} E-Books)`}
                        </h4>
                        <button
                          onClick={handleStartAdd}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'নতুন ই-বুক যোগ করুন' : 'Add New E-Book'}</span>
                        </button>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                        {ebooks.map((book) => {
                          const displayTitle = language === 'bn' && book.titleBn ? book.titleBn : book.title;
                          const displayAuthor = language === 'bn' && book.authorBn ? book.authorBn : book.author;
                          return (
                            <div key={book.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-14 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                  {book.coverImage && (
                                    <img src={book.coverImage} alt={displayTitle} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {displayTitle}
                                  </h5>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span>{displayAuthor}</span>
                                    <span aria-hidden="true">·</span>
                                    <span className={`font-semibold ${book.type === 'free' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                      {book.type === 'free' ? 'FREE' : `${settings.currencySymbol} ${book.price}`}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span>{book.category}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(book)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteEbook(book.id);
                                    setSaveSuccess(true);
                                    setTimeout(() => setSaveSuccess(false), 2000);
                                  }}
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            resetCatalog();
                            setSaveSuccess(true);
                            setTimeout(() => setSaveSuccess(false), 2500);
                          }}
                          className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'ডিফল্ট বইগুলোতে রিসেট করুন' : 'Reset to Default Books'}</span>
                        </button>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {language === 'bn' ? 'সকল পরিবর্তন রিয়েল-টাইমে অটো-সেভ হয় (রিফ্রেশ প্রয়োজন নেই)' : 'All changes auto-save in real time without refresh'}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: STORE & WHATSAPP SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                      {language === 'bn' ? 'হোয়াটসঅ্যাপ বিজনেস ও স্টোর ব্র্যান্ডিং' : 'Store Branding & WhatsApp Business'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Store Brand Name (English)</label>
                        <input
                          type="text"
                          value={settingsForm.storeName}
                          onChange={(e) => handleLiveSettingChange({ storeName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">স্টোরের নাম (বাংলা)</label>
                        <input
                          type="text"
                          value={settingsForm.storeNameBn}
                          onChange={(e) => handleLiveSettingChange({ storeNameBn: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Store Tagline (English)</label>
                        <input
                          type="text"
                          value={settingsForm.storeTagline}
                          onChange={(e) => handleLiveSettingChange({ storeTagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">স্টোর ট্যাগলাইন (বাংলা)</label>
                        <input
                          type="text"
                          value={settingsForm.storeTaglineBn}
                          onChange={(e) => handleLiveSettingChange({ storeTaglineBn: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Brand Logo URL / Path</label>
                        <input
                          type="text"
                          value={settingsForm.logoUrl || ''}
                          onChange={(e) => handleLiveSettingChange({ logoUrl: e.target.value })}
                          placeholder="/assets/aistudio/1794301559714_e54adc4f.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                          WhatsApp Target Number (Without + or spaces) *
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsappNumber}
                          onChange={(e) => handleLiveSettingChange({ whatsappNumber: e.target.value })}
                          placeholder="8801700968369"
                          className="w-full px-3 py-2 rounded-lg border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                          WhatsApp Display Text
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsappDisplayNumber}
                          onChange={(e) => handleLiveSettingChange({ whatsappDisplayNumber: e.target.value })}
                          placeholder="+880 1700-968369"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                      {language === 'bn' ? 'বাংলাদেশি মোবাইল ওয়ালেট নম্বর (বিকাশ ও নগদ)' : 'Mobile Banking Wallet Numbers (bKash & Nagad)'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* bKash */}
                      <div className="p-3.5 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/40 dark:bg-pink-950/20 space-y-2">
                        <label className="font-bold text-pink-700 dark:text-pink-300 block">bKash (বিকাশ নম্বর)</label>
                        <input
                          type="text"
                          value={settingsForm.bkashNumber}
                          onChange={(e) => handleLiveSettingChange({ bkashNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-800 font-mono text-xs"
                        />
                        <select
                          value={settingsForm.bkashType}
                          onChange={(e) => handleLiveSettingChange({ bkashType: e.target.value as 'Personal' | 'Merchant' })}
                          className="w-full px-2 py-1.5 rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                        </select>
                      </div>

                      {/* Nagad */}
                      <div className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20 space-y-2">
                        <label className="font-bold text-orange-700 dark:text-orange-300 block">Nagad (নগদ নম্বর)</label>
                        <input
                          type="text"
                          value={settingsForm.nagadNumber}
                          onChange={(e) => handleLiveSettingChange({ nagadNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 font-mono text-xs"
                        />
                        <select
                          value={settingsForm.nagadType}
                          onChange={(e) => handleLiveSettingChange({ nagadType: e.target.value as 'Personal' | 'Merchant' })}
                          className="w-full px-2 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Security Credentials Setting (Salted SHA-256 — Zero Plaintext Storage) */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'এডমিন লগইন নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন (SHA-256 Encrypted)' : 'Admin Security Credentials (SHA-256 Encrypted)'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === 'bn'
                          ? 'নিরাপত্তার স্বার্থে আপনার বর্তমান পাসওয়ার্ড কোথাও প্লেইন-টেক্সটে দেখানো বা সংরক্ষণ করা হয় না। নতুন পাসওয়ার্ড সেট করতে নিচের ঘর পূরণ করুন।'
                          : 'For security, your current password is encrypted and never displayed in plaintext. Enter a new username or password below to update.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                          {language === 'bn' ? 'নতুন ইউজারনেম (ঐচ্ছিক)' : 'New Admin Username (Optional)'}
                        </label>
                        <input
                          type="text"
                          autoComplete="off"
                          value={newAdminUser}
                          onChange={(e) => setNewAdminUser(e.target.value)}
                          placeholder={language === 'bn' ? 'অপরিবর্তিত রাখতে ফাঁকা রাখুন' : 'Leave blank to keep current'}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                          {language === 'bn' ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক)' : 'New Admin Password (Optional)'}
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={newAdminPass}
                          onChange={(e) => setNewAdminPass(e.target.value)}
                          placeholder={language === 'bn' ? 'নতুন পাসওয়ার্ড দিন' : 'Enter new password'}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAdminUser.trim() && !newAdminPass.trim()) return;
                            const patch: Partial<typeof settingsForm> = {};
                            if (newAdminUser.trim()) {
                              patch.adminUsernameHash = computeSaltedHash(newAdminUser.trim().toLowerCase());
                            }
                            if (newAdminPass.trim()) {
                              patch.adminPasscodeHash = computeSaltedHash(newAdminPass.trim());
                              createAdminSession(patch.adminPasscodeHash);
                            }
                            handleLiveSettingChange(patch);
                            setNewAdminUser('');
                            setNewAdminPass('');
                            setSaveSuccess(true);
                            setTimeout(() => setSaveSuccess(false), 2500);
                          }}
                          className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          {language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Encrypted Credentials'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {language === 'bn' ? '✓ টাইপ করার সাথে সাথেই ওয়েবসাইটে লাইভ আপডেট হচ্ছে' : '✓ Auto-saving live as you type'}
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Settings'}</span>
                    </button>
                  </div>

                </form>
              )}

              {/* TAB 3: CPANEL HOSTING GUIDE & FILE MANAGEMENT */}
              {activeTab === 'cpanel' && (
                <div className="space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  
                  {/* 1-Click Complete cPanel Ready ZIP Download */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 text-white space-y-3 shadow-md">
                    <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
                      <Download className="w-5 h-5 text-emerald-200" />
                      <span>
                        {language === 'bn' 
                          ? 'রেডি-মেড সিপ্যানেল ওয়েবসাইট প্যাকেজ (১-ক্লিকে ডাউনলোড)' 
                          : '1-Click cPanel Ready Website ZIP'}
                      </span>
                    </div>
                    <p className="text-emerald-50 text-xs leading-relaxed">
                      {language === 'bn'
                        ? 'আপনার কোডিং বা গিটহাবের কোনো কিছু জানার প্রয়োজন নেই! আমরা পুরো ওয়েবসাইট বিল্ড করে একটি জিপ ফাইলে তৈরি করে রেখেছি। নিচের বাটনে ক্লিক করে জিপটি ডাউনলোড করে নিন।'
                        : 'No coding or GitHub knowledge needed! The entire compiled site is packaged into a ready-to-upload ZIP file.'}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-3">
                      <a
                        href="/kitabghar-cpanel-ready.zip"
                        download="kitabghar-cpanel-ready.zip"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-800 font-extrabold rounded-xl transition-all text-xs shadow-md hover:bg-emerald-50 active:scale-95"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'kitabghar-cpanel-ready.zip ডাউনলোড করুন' : 'Download cPanel Ready ZIP'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Full Store Backup & Restore (Books + Settings + Reviews + Coupons) */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Save className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'সম্পূর্ণ ওয়েবসাইট ডাটা ব্যাকআপ ও রিস্টোর (১-ক্লিক)' : 'Full Website Data Backup & Restore'}</span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {language === 'bn'
                        ? 'আপনার সকল বই, সেটিংস, বান্ডেল, কুপন ও রিভিউ একটি ফাইলে ব্যাকআপ রাখুন অথবা আগের ব্যাকআপ ফাইল আপলোড করে রিস্টোর করুন—যাতে কখনোই কোনো তথ্য বারবার লিখতে না হয়।'
                        : 'Export or restore all your books, settings, bundles, coupons, and reviews in one JSON file so you never have to re-enter data.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={exportFullStoreBackupJSON}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-xs shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{language === 'bn' ? 'সম্পূর্ণ ব্যাকআপ ডাউনলোড (.json)' : 'Download Full Backup (.json)'}</span>
                      </button>

                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors text-xs shadow-xs cursor-pointer">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'ব্যাকআপ ফাইল রিস্টোর করুন' : 'Restore Backup JSON'}</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                const ok = importFullStoreBackupJSON(reader.result);
                                if (ok) {
                                  setSaveSuccess(true);
                                  setTimeout(() => setSaveSuccess(false), 3000);
                                }
                              }
                            };
                            reader.readAsText(file);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          resetAllSettings();
                          resetCatalog();
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'সব সেটিংস ডিফল্টে রিসেট করুন' : 'Factory Reset All'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <FileCode className="w-4 h-4" />
                      <span>{language === 'bn' ? 'ক্যাটালগ ফাইল: products.json' : 'Single Source of Truth: products.json'}</span>
                    </div>
                    <p className="text-slate-300">
                      {language === 'bn'
                        ? 'আপনার ওয়েবসাইটের সব বই ও দাম products.json ফাইল থেকে সরাসরি লোড হয়। যেকোনো পরিবর্তন করার পর এখান থেকে products.json ডাউনলোড করে সিপ্যানেলে আপলোড করলেই লাইভ হয়ে যাবে।'
                        : 'Your website reads all e-book details directly from products.json. Whenever you add or edit books here, export the JSON file and drop it into your cPanel host.'}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={exportProductsJSON}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Current products.json</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'সিপ্যানেলে হোস্ট ও আপডেট করার সহজ ৪টি ধাপ:' : 'How to Deploy and Update on cPanel Hosting:'}
                    </h4>

                    <ol className="list-decimal list-inside space-y-3 pl-1">
                      <li>
                        <strong>{language === 'bn' ? '১. প্রাথমিক ওয়েবসাইট আপলোড:' : 'Initial Site Deployment:'}</strong>
                        <p className="pl-5 text-slate-500 dark:text-slate-400 pt-0.5">
                          {language === 'bn'
                            ? 'প্রজেক্ট বিল্ড করে dist ফোল্ডারের ভেতরের সব ফাইল আপনার সিপ্যানেল File Manager-এর public_html-এ আপলোড করুন।'
                            : 'Upload the contents of the generated dist/ folder into your cPanel public_html/ directory.'}
                        </p>
                      </li>
                      <li>
                        <strong>{language === 'bn' ? '২. যেকোনো সময় বই আপডেট করা (বিল্ড করা ছাড়াই):' : 'Updating E-Books Anytime (No Rebuild Needed!):'}</strong>
                        <p className="pl-5 text-slate-500 dark:text-slate-400 pt-0.5">
                          {language === 'bn'
                            ? 'এই এডমিন প্যানেলে বই যোগ বা এডিট করে "Export products.json" চাপুন। তারপর সিপ্যানেলে public_html-এ থাকা আগের products.json ফাইলটি রিপ্লেস করে দিন। সাথে সাথে ওয়েবসাইটে নতুন বই দেখা যাবে!'
                            : 'Export products.json from here and overwrite public_html/products.json in cPanel File Manager. Your live site updates instantly!'}
                        </p>
                      </li>
                      <li>
                        <strong>{language === 'bn' ? '৩. পেইড ও ফ্রি ই-বুক PDF ফাইল রাখা:' : 'Storing PDF E-Book Files on cPanel:'}</strong>
                        <p className="pl-5 text-slate-500 dark:text-slate-400 pt-0.5">
                          {language === 'bn'
                            ? 'সিপ্যানেলে public_html-এর ভেতর ebooks ফোল্ডার তৈরি করে আপনার PDF ফাইলগুলো আপলোড করতে পারেন (যেমন: public_html/ebooks/my-book.pdf)।'
                            : 'Create an ebooks/ folder in your cPanel public_html/ to host your PDF files.'}
                        </p>
                      </li>
                      <li>
                        <strong>{language === 'bn' ? '৪. হোয়াটসঅ্যাপে পেমেন্ট যাচাই ও বই পাঠানো:' : 'Handling WhatsApp Paid Deliveries:'}</strong>
                        <p className="pl-5 text-slate-500 dark:text-slate-400 pt-0.5">
                          {language === 'bn'
                            ? `গ্রাহক যখন হোয়াটসঅ্যাপে অর্ডার পাঠাবে, আপনি মেসেজে তার নাম, বিকাশ/নগদ নম্বর ও TrxID দেখতে পাবেন। আপনার বিকাশ/নগদ অ্যাপে টাকা চেক করে গ্রাহককে হোয়াটসঅ্যাপে বইয়ের ফাইল পাঠিয়ে দিন!`
                            : 'Verify the customer TrxID in your bKash app and reply with the e-book link on WhatsApp!'}
                        </p>
                      </li>
                    </ol>
                  </div>

                </div>
              )}

              {/* TAB 4: DEDICATED SEO & OPENGRAPH MANAGEMENT */}
              {activeTab === 'seo' && (
                <div className="space-y-8 text-xs leading-relaxed">
                  
                  {/* Top Bar with Description & Quick Tools */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'bn' ? 'এসইও ও সোশ্যাল শেয়ার সেটিংস' : 'Search Engine & OpenGraph Management'}</span>
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        {language === 'bn'
                          ? 'গুগল সার্চ ও ফেসবুক/হোয়াটসঅ্যাপে লিংক শেয়ার করার সময় আপনার ওয়েবসাইটের টাইটেল, ছবি ও বিবরণ এখান থেকে কাস্টমাইজ করুন।'
                          : 'Control how your website appears on Google Search, WhatsApp, Facebook, X (Twitter), and LinkedIn.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleAutoOptimizeSEO}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs active:scale-95"
                        title="Auto-generate optimized SEO titles and descriptions based on your store data"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'bn' ? 'অটো-অপ্টিমাইজ করুন' : 'Auto-Optimize'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const snippet = generateStaticHTMLSnippet();
                          navigator.clipboard.writeText(snippet);
                          setCopiedSnippet(true);
                          setTimeout(() => setCopiedSnippet(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-xs active:scale-95"
                        title="Copy static HTML meta tags to paste into index.html for cPanel"
                      >
                        {copiedSnippet ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'HTML ট্যাগ কপি' : 'Copy HTML'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {autoOptimizedNotice && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'bn' ? 'আপনার স্টোর ও বইয়ের তথ্যের ভিত্তিতে এসইও ট্যাগ অপ্টিমাইজ করা হয়েছে! নিচে চেক করে সেভ করুন।' : 'SEO tags have been auto-optimized based on your store and catalog!'}</span>
                    </div>
                  )}

                  {/* REAL-TIME PREVIEW SECTION */}
                  <div className="space-y-4">
                    <h5 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'bn' ? 'লাইভ সোশ্যাল শেয়ার ও সার্চ রেজাল্ট প্রিভিউ' : 'Live Social & Search Snippet Previews'}</span>
                    </h5>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* PREVIEW 1: WhatsApp / Facebook OpenGraph Card */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ ও ফেসবুক শেয়ার কার্ড' : 'WhatsApp & Facebook Share Card'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">OpenGraph Preview</span>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                          {/* Card Banner Image */}
                          <div className="relative aspect-16/9 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                            {seoForm.ogImage ? (
                              <img
                                src={seoForm.ogImage}
                                alt="Social Share Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to logo
                                  (e.target as HTMLImageElement).src = settings.logoUrl || '/assets/aistudio/1794301559714_e54adc4f.jpg';
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center p-6 text-slate-400 text-xs">
                                No image provided
                              </div>
                            )}
                          </div>

                          {/* Card Text Content */}
                          <div className="p-3.5 space-y-1 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">
                              {seoForm.canonicalUrl 
                                ? seoForm.canonicalUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') 
                                : 'YOURDOMAIN.COM'}
                            </span>
                            <h6 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                              {language === 'bn' ? (seoForm.ogTitleBn || seoForm.ogTitle) : seoForm.ogTitle}
                            </h6>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {language === 'bn' ? (seoForm.ogDescriptionBn || seoForm.ogDescription) : seoForm.ogDescription}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* PREVIEW 2: Google Search Snippet (SERP) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>{language === 'bn' ? 'গুগল সার্চ রেজাল্ট প্রিভিউ' : 'Google Search Snippet Preview'}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">SERP Result</span>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5 font-sans">
                          {/* Breadcrumb & Site Name */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-slate-200 dark:border-slate-700 shrink-0 p-0.5">
                              <img src={settings.logoUrl || "/assets/aistudio/1794301559714_e54adc4f.jpg"} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {seoForm.siteName || settings.storeName}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {seoForm.canonicalUrl || 'https://yourdomain.com'}
                              </span>
                            </div>
                          </div>

                          {/* Blue Clickable Title */}
                          <h6 className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1 leading-snug">
                            {language === 'bn' ? (seoForm.metaTitleBn || seoForm.metaTitle) : seoForm.metaTitle}
                          </h6>

                          {/* Snippet Description */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {language === 'bn' ? (seoForm.metaDescriptionBn || seoForm.metaDescription) : seoForm.metaDescription}
                          </p>

                          {/* Character Count Quality Indicators */}
                          <div className="pt-2 flex items-center gap-3 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                            <span>
                              Title: <strong className={(seoForm.metaTitle.length >= 30 && seoForm.metaTitle.length <= 60) ? 'text-emerald-600' : 'text-amber-500'}>
                                {seoForm.metaTitle.length} chars
                              </strong> (Optimal: 30-60)
                            </span>
                            <span>•</span>
                            <span>
                              Desc: <strong className={(seoForm.metaDescription.length >= 120 && seoForm.metaDescription.length <= 160) ? 'text-emerald-600' : 'text-amber-500'}>
                                {seoForm.metaDescription.length} chars
                              </strong> (Optimal: 120-160)
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* SEO EDITING FORM */}
                  <form onSubmit={handleSaveSEO} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-6">
                    
                    {/* SECTION 1: Search Engine Titles */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {language === 'bn' ? '১. সার্চ ইঞ্জিন মেটা টাইটেল (Title Tags)' : '1. Search Engine Title Tags'}
                        </h5>
                        <p className="text-slate-400 text-[11px]">
                          ব্রাউজার ট্যাব এবং গুগলের নীল লিংকে এই টাইটেল প্রদর্শিত হবে (সর্বোত্তম দৈর্ঘ্য: ৩০–৬০ অক্ষর)।
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              Meta Title (English) *
                            </label>
                            <span className={`text-[10px] font-mono ${seoForm.metaTitle.length > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                              {seoForm.metaTitle.length}/60
                            </span>
                          </div>
                          <input
                            type="text"
                            required
                            value={seoForm.metaTitle}
                            onChange={(e) => handleLiveSeoChange({ metaTitle: e.target.value })}
                            placeholder="e.g. KitabGhar - Digital E-Book Store | Free & Paid Books"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              মেটা টাইটেল (বাংলা)
                            </label>
                            <span className="text-[10px] font-mono text-slate-400">
                              {seoForm.metaTitleBn.length} chars
                            </span>
                          </div>
                          <input
                            type="text"
                            value={seoForm.metaTitleBn}
                            onChange={(e) => handleLiveSeoChange({ metaTitleBn: e.target.value })}
                            placeholder="যেমন: কিতাবঘর - ডিজিটাল ই-বুক স্টোর ও হোয়াটসঅ্যাপ অর্ডার"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Search Engine Meta Descriptions */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {language === 'bn' ? '২. সার্চ ইঞ্জিন মেটা বিবরণ (Meta Description)' : '2. Search Engine Meta Description'}
                        </h5>
                        <p className="text-slate-400 text-[11px]">
                          গুগল সার্চ রেজাল্ট এবং সোশ্যাল মিডিয়ায় টাইটেলের নিচে ১–২ লাইনের সংক্ষিপ্ত বিবরণ (সর্বোত্তম দৈর্ঘ্য: ১২০–১৬০ অক্ষর)।
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              Meta Description (English) *
                            </label>
                            <span className={`text-[10px] font-mono ${seoForm.metaDescription.length > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                              {seoForm.metaDescription.length}/160
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            required
                            value={seoForm.metaDescription}
                            onChange={(e) => handleLiveSeoChange({ metaDescription: e.target.value })}
                            placeholder="Download free curated e-books or buy premium tech guides with instant WhatsApp checkout and bKash/Nagad verification in Bangladesh."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              মেটা বিবরণ (বাংলা)
                            </label>
                            <span className="text-[10px] font-mono text-slate-400">
                              {seoForm.metaDescriptionBn.length} chars
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={seoForm.metaDescriptionBn}
                            onChange={(e) => handleLiveSeoChange({ metaDescriptionBn: e.target.value })}
                            placeholder="ফ্রি ও পেইড বাংলা-ইংরেজি ই-বুক ডাউনলোড করুন। বিকাশ ও নগদ পেমেন্ট ভেরিফিকেশন সহ হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন।"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: OpenGraph & Social Media Cards */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {language === 'bn' ? '৩. ওপেন-গ্রাফ ও সোশ্যাল মিডিয়া শেয়ার কার্ড (OpenGraph & Twitter)' : '3. OpenGraph & Social Cards (WhatsApp / FB / X)'}
                        </h5>
                        <p className="text-slate-400 text-[11px]">
                          হোয়াটসঅ্যাপে বা ফেসবুকে লিংক পাঠালে যে বড় ব্যানার ও টেক্সট ভেসে ওঠে।
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Social Share Title (og:title)
                          </label>
                          <input
                            type="text"
                            value={seoForm.ogTitle}
                            onChange={(e) => handleLiveSeoChange({ ogTitle: e.target.value })}
                            placeholder="KitabGhar - Your Ultimate Book Home"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            সোশ্যাল শেয়ার টাইটেল (বাংলা)
                          </label>
                          <input
                            type="text"
                            value={seoForm.ogTitleBn || ''}
                            onChange={(e) => handleLiveSeoChange({ ogTitleBn: e.target.value })}
                            placeholder="কিতাবঘর - আপনার বইয়ের নির্ভরযোগ্য ঠিকানা"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Social Share Description (og:description)
                          </label>
                          <input
                            type="text"
                            value={seoForm.ogDescription}
                            onChange={(e) => handleLiveSeoChange({ ogDescription: e.target.value })}
                            placeholder="Discover high-impact programming, freelancing, and business e-books. Instant free downloads and 1-click WhatsApp checkout."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Social Share Image URL (og:image)
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center p-1">
                              <img
                                src={seoForm.ogImage || settings.logoUrl || '/assets/aistudio/1794301559714_e54adc4f.jpg'}
                                alt="Thumb"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <input
                              type="text"
                              value={seoForm.ogImage}
                              onChange={(e) => handleLiveSeoChange({ ogImage: e.target.value })}
                              placeholder="/assets/aistudio/1794301559714_e54adc4f.jpg or https://..."
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {language === 'bn' 
                              ? 'সোশ্যাল কার্ডে প্রদর্শনের জন্য ১২০০x৬৩০ সাইজের ব্যানার বা আপনার স্টোর লোগোর পাথ দিন।' 
                              : 'Recommended 1200x630 image or store logo asset path.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Discovery, Canonical & Verification */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {language === 'bn' ? '৪. কিওয়ার্ডস, ক্যানোনিকাল ও অথর মেটাডাটা' : '4. Keywords, Canonical URL & Attribution'}
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Meta Keywords (কমা দিয়ে আলাদা করুন)
                          </label>
                          <input
                            type="text"
                            value={seoForm.keywords}
                            onChange={(e) => handleLiveSeoChange({ keywords: e.target.value })}
                            placeholder="kitabghar, bangla ebook, pdf download, bkash payment, nagad payment, programming books, freelancing bangla"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Canonical URL (কাস্টম ডোমেইন)
                          </label>
                          <input
                            type="text"
                            value={seoForm.canonicalUrl || ''}
                            onChange={(e) => handleLiveSeoChange({ canonicalUrl: e.target.value })}
                            placeholder="https://yourdomain.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Twitter / X Handle
                          </label>
                          <input
                            type="text"
                            value={seoForm.twitterHandle || ''}
                            onChange={(e) => handleLiveSeoChange({ twitterHandle: e.target.value })}
                            placeholder="@kitabghar"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Author / Founder Name
                          </label>
                          <input
                            type="text"
                            value={seoForm.author}
                            onChange={(e) => handleLiveSeoChange({ author: e.target.value })}
                            placeholder="Tahsin Islam"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Site Brand Name (og:site_name)
                          </label>
                          <input
                            type="text"
                            value={seoForm.siteName || ''}
                            onChange={(e) => handleLiveSeoChange({ siteName: e.target.value })}
                            placeholder="KitabGhar"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] text-slate-400">
                        {language === 'bn' 
                          ? 'সেভ করলে ব্রাউজার ও ওপেনগ্রাফ মেটাডাটা তাৎক্ষণিক আপডেট হবে।' 
                          : 'Changes take effect immediately across browser title and metadata.'}
                      </p>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={handleAutoOptimizeSEO}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                        >
                          {language === 'bn' ? 'রিসেট / অপ্টিমাইজ' : 'Re-Optimize'}
                        </button>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md text-xs w-full sm:w-auto cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{language === 'bn' ? 'এসইও সেটিংস সেভ করুন' : 'Save SEO Settings'}</span>
                        </button>
                      </div>
                    </div>

                  </form>

                </div>
              )}

              {/* TAB 5: COUPONS & DISCOUNT CODES */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  {/* Top Intro */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'কুপন ও ডিসকাউন্ট কোড ব্যবস্থাপনা' : 'Coupons & Promo Codes'}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'bn'
                          ? 'বিশেষ ক্যাম্পেইন ও উৎসবের জন্য কুপন কোড তৈরি করুন। চেকআউটে স্বয়ংক্রিয়ভাবে ছাড় হিসাব হবে।'
                          : 'Create promo codes for campaigns. Discounts auto-calculate in checkout and WhatsApp orders.'}
                      </p>
                    </div>
                  </div>

                  {/* Create New Coupon Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCouponCode.trim()) return;
                      addCoupon({
                        code: newCouponCode.trim().toUpperCase(),
                        discountType: newDiscountType,
                        discountValue: Number(newDiscountValue) || 10,
                        minSpend: Number(newMinSpend) || 0,
                        description: newCouponDesc.trim() || `${newDiscountValue}${newDiscountType === 'percentage' ? '%' : ' BDT'} discount`,
                        descriptionBn: newCouponDesc.trim() || `${newDiscountValue}${newDiscountType === 'percentage' ? '%' : ' টাকা'} ছাড়`,
                        isActive: true
                      });
                      setNewCouponCode('');
                      setNewCouponDesc('');
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2500);
                    }}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4"
                  >
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'bn' ? 'নতুন কুপন কোড তৈরি করুন' : 'Add New Coupon'}</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'কুপন কোড' : 'Coupon Code'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. BOI30"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ছাড়ের ধরণ' : 'Discount Type'}
                        </label>
                        <select
                          value={newDiscountType}
                          onChange={(e) => setNewDiscountType(e.target.value as 'percentage' | 'fixed')}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="percentage">{language === 'bn' ? 'শতাংশ (%)' : 'Percentage (%)'}</option>
                          <option value="fixed">{language === 'bn' ? 'নির্দিষ্ট টাকা (৳)' : 'Fixed Amount (BDT)'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ছাড়ের পরিমাণ' : 'Discount Amount'} *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={newDiscountValue}
                          onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'সর্বনিম্ন খরচ (ঐচ্ছিক)' : 'Min Spend (BDT)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newMinSpend}
                          onChange={(e) => setNewMinSpend(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <input
                        type="text"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        placeholder={language === 'bn' ? 'বিবরণ (যেমন: ঈদ স্পেশাল ২০% ছাড়)' : 'Description (e.g. Eid special 20% discount)'}
                        className="w-full sm:flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{language === 'bn' ? 'কুপন যোগ করুন' : 'Add Coupon'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Coupons List */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {language === 'bn' ? `বিদ্যমান কুপনসমূহ (${coupons.length})` : `Existing Coupons (${coupons.length})`}
                    </h5>

                    {coupons.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        {language === 'bn' ? 'কোনো কুপন তৈরি করা হয়নি।' : 'No coupons created yet.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {coupons.map((c) => (
                          <div
                            key={c.code}
                            className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              c.isActive
                                ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs'
                                : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                  {c.code}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  c.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {c.isActive ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium truncate">
                                {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `৳${c.discountValue} Flat Off`}
                                {c.minSpend ? ` (Min spend ৳${c.minSpend})` : ''}
                              </p>
                              {c.description && (
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {language === 'bn' && c.descriptionBn ? c.descriptionBn : c.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewCouponCode(c.code);
                                  setNewDiscountType(c.discountType);
                                  setNewDiscountValue(c.discountValue);
                                  setNewMinSpend(c.minSpend || 0);
                                  setNewCouponDesc(c.descriptionBn || c.description || '');
                                }}
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Edit Coupon"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleCoupon(c.code)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              >
                                {c.isActive ? (language === 'bn' ? 'অফ করুন' : 'Disable') : (language === 'bn' ? 'অন করুন' : 'Enable')}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCoupon(c.code)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SITE SECTIONS, HERO, FLASH SALE & AUTHOR STORY CONTROL */}
              {activeTab === 'sections' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSettings(settingsForm);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2500);
                  }}
                  className="space-y-8 text-xs"
                >
                  {/* 1. Master Section Visibility Toggles */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2.5 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-emerald-600" />
                          <span>{language === 'bn' ? '১. ওয়েবসাইটের সকল সেকশন অন/অফ সুইচ (Master Visibility)' : '1. Master Section Visibility Switches'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {language === 'bn'
                            ? 'যেকোনো সেকশন ১-ক্লিকে চালু বা বন্ধ করলে সাথে সাথেই ওয়েবসাইটে লাইভ পরিবর্তন হবে (ব্রাউজার রিফ্রেশ প্রয়োজন নেই)।'
                            : 'Toggle any homepage section or popup on or off with 1 click — updates live immediately.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Toggle 1: Flash Sale Banner */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'ফ্ল্যাশ সেল কাউন্টডাউন ব্যানার' : 'Flash Sale Top Banner'}
                          </span>
                          <span className="text-[10px] text-slate-400">Top countdown bar</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.flashSale?.enabled !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              flashSale: {
                                ...(settingsForm.flashSale || DEFAULT_STORE_SETTINGS.flashSale!),
                                enabled: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>

                      {/* Toggle 2: Combo Bundles Section */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'কম্বো বান্ডেল অফার সেকশন' : 'Combo Bundles Section'}
                          </span>
                          <span className="text-[10px] text-slate-400">Multi-book discount packs</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.showBundlesSection !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({ showBundlesSection: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>

                      {/* Toggle 3: Customer Reviews Section */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'পাঠকদের রিভিউ ও রেটিং সেকশন' : 'Customer Reviews Section'}
                          </span>
                          <span className="text-[10px] text-slate-400">5-star reader testimonials</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.showReviewsSection !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({ showReviewsSection: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>

                      {/* Toggle 4: Author & Founder Trust Story */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'লেখক ও প্রতিষ্ঠাতার গল্প' : 'Author & Founder Story'}
                          </span>
                          <span className="text-[10px] text-slate-400">KitabGhar mission & trust</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.authorStory?.enabled !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                enabled: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>

                      {/* Toggle 5: FAQ Section */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'FAQ Accordion Section'}
                          </span>
                          <span className="text-[10px] text-slate-400">Questions & answers</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.showFaqSection !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({ showFaqSection: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>

                      {/* Toggle 6: Live Sales Popup */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'লাইভ সেলস পপআপ নোটিফিকেশন' : 'Live Sales Social Proof Popup'}
                          </span>
                          <span className="text-[10px] text-slate-400">Bottom-left buyer toast</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.showLiveSalesPopup !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({ showLiveSalesPopup: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>

                      {/* Toggle 7: How It Works Section */}
                      <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {language === 'bn' ? 'অর্ডার ও ডেলিভারি গাইড সেকশন' : 'How It Works Guide Section'}
                          </span>
                          <span className="text-[10px] text-slate-400">3-step payment & delivery guide</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsForm.showHowItWorksSection !== false}
                          onChange={(e) =>
                            handleLiveSettingChange({ showHowItWorksSection: e.target.checked })
                          }
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* 1B. Homepage Hero Headline & Subtitle Editor */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? 'হোমপেজ মেইন হিরো হেডলাইন ও সাবটাইটেল এডিটর' : 'Homepage Hero Headline & Subtitle Editor'}</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'হিরো মেইন হেডলাইন (বাংলা)' : 'Hero Headline (Bangla)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.heroTitleBn || ''}
                          onChange={(e) => handleLiveSettingChange({ heroTitleBn: e.target.value })}
                          placeholder="আপনার পরবর্তী প্রিয় ডিজিটাল বইটি খুঁজে নিন।"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'হিরো মেইন হেডলাইন (English)' : 'Hero Headline (English)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.heroTitle || ''}
                          onChange={(e) => handleLiveSettingChange({ heroTitle: e.target.value })}
                          placeholder="Discover your next digital read."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'হিরো সাবটাইটেল বিবরণ (বাংলা)' : 'Hero Subtitle (Bangla)'}
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.heroSubtitleBn || ''}
                          onChange={(e) => handleLiveSettingChange({ heroSubtitleBn: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'হিরো সাবটাইটেল বিবরণ (English)' : 'Hero Subtitle (English)'}
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.heroSubtitle || ''}
                          onChange={(e) => handleLiveSettingChange({ heroSubtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Flash Sale Banner & Free Download Gift Coupon Settings */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-500" />
                        <span>{language === 'bn' ? '২. ফ্ল্যাশ সেল ব্যানার ও ফ্রি ডাউনলোড গিফট কুপন কন্ট্রোল' : '2. Flash Sale Banner & Download Gift Coupon'}</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ফ্ল্যাশ সেল ব্যাজ (বাংলা)' : 'Flash Sale Badge (Bangla)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.flashSale?.badgeBn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              flashSale: {
                                ...(settingsForm.flashSale || DEFAULT_STORE_SETTINGS.flashSale!),
                                badgeBn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ফ্ল্যাশ সেল ব্যাজ (English)' : 'Flash Sale Badge (English)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.flashSale?.badgeEn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              flashSale: {
                                ...(settingsForm.flashSale || DEFAULT_STORE_SETTINGS.flashSale!),
                                badgeEn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ফ্ল্যাশ সেল অফার টেক্সট (বাংলা)' : 'Flash Sale Offer Text (Bangla)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.flashSale?.textBn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              flashSale: {
                                ...(settingsForm.flashSale || DEFAULT_STORE_SETTINGS.flashSale!),
                                textBn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ফ্ল্যাশ সেল অফার টেক্সট (English)' : 'Flash Sale Offer Text (English)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.flashSale?.textEn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              flashSale: {
                                ...(settingsForm.flashSale || DEFAULT_STORE_SETTINGS.flashSale!),
                                textEn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ফ্ল্যাশ সেল প্রোমো কোড' : 'Flash Sale Promo Code'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.flashSale?.promoCode || 'KITAB20'}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              flashSale: {
                                ...(settingsForm.flashSale || DEFAULT_STORE_SETTINGS.flashSale!),
                                promoCode: e.target.value.toUpperCase()
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-amber-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'ফ্রি বই ডাউনলোড বোনাস গিফট কোড' : 'Free Download Thank-You Gift Coupon'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.downloadGiftCouponCode || 'FIRST20'}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              downloadGiftCouponCode: e.target.value.toUpperCase()
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Author & Founder Trust Story Editor */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? '৩. লেখক পরিচিতি ও কিতাবঘর ট্রাস্ট স্টোরি এডিটর' : '3. Author & Founder Trust Story Editor'}</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'প্রতিষ্ঠাতা / লেখকের নাম (বাংলা)' : 'Founder Name (Bangla)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.authorStory?.founderNameBn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                founderNameBn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'প্রতিষ্ঠাতা / লেখকের নাম (English)' : 'Founder Name (English)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.authorStory?.founderName || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                founderName: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'পদবী / পরিচয় (বাংলা)' : 'Founder Role (Bangla)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.authorStory?.founderRoleBn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                founderRoleBn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'পদবী / পরিচয় (English)' : 'Founder Role (English)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.authorStory?.founderRole || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                founderRole: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'স্টোরি হেডলাইন (বাংলা)' : 'Story Headline (Bangla)'}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.authorStory?.headlineBn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                headlineBn: e.target.value,
                                headline: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {language === 'bn' ? 'লেখক ও কিতাবঘরের বিস্তারিত গল্প (বাংলা)' : 'Founder Bio & Mission Story (Bangla)'}
                        </label>
                        <textarea
                          rows={3}
                          value={settingsForm.authorStory?.bioBn || ''}
                          onChange={(e) =>
                            handleLiveSettingChange({
                              authorStory: {
                                ...(settingsForm.authorStory || DEFAULT_STORE_SETTINGS.authorStory!),
                                bioBn: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {language === 'bn' ? '✓ সকল সুইচ ও টেক্সট রিয়েল-টাইমে অটো-সেভ হচ্ছে' : '✓ Auto-saving all switches & text in real time'}
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{language === 'bn' ? 'সকল সেকশন পরিবর্তন সেভ করুন' : 'Save All Section Controls'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 7: BUNDLES, FAQ, REVIEWS & LIVE SOCIAL PROOF MANAGER */}
              {activeTab === 'bundles_faq' && (
                <div className="space-y-8 text-xs">
                  
                  {/* 1. COMBO BUNDLES MANAGER */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <span>{language === 'bn' ? '১. কম্বো বান্ডেল অফার ম্যানেজার' : '1. Combo Bundles Manager'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {language === 'bn' ? 'একাধিক বই একত্রে বিশেষ ছাড়ে বিক্রি করার জন্য কম্বো বান্ডেল তৈরি, এডিট বা ডিলিট করুন।' : 'Create, edit, or remove multi-book discount bundles.'}
                        </p>
                      </div>
                    </div>

                    {/* Add / Edit Bundle Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!bundleNameBn.trim()) return;
                        const currentBundles = settings.bundles || DEFAULT_STORE_SETTINGS.bundles || [];
                        const orig = Number(bundleOrigPrice) || 700;
                        const price = Number(bundlePrice) || 450;
                        const bundlePayload: ComboBundle = {
                          id: editingBundleId || `bundle-${Date.now()}`,
                          name: bundleNameEn.trim() || bundleNameBn.trim(),
                          nameBn: bundleNameBn.trim(),
                          tagline: bundleTaglineBn.trim() || 'Complete mastery bundle',
                          taglineBn: bundleTaglineBn.trim() || 'একসাথে কিনলে বিশেষ ছাড়!',
                          bookIds: selectedBundleBooks.length > 0 ? selectedBundleBooks : ebooks.slice(0, 2).map(b => b.id),
                          originalPrice: orig,
                          bundlePrice: price,
                          savings: Math.max(0, orig - price),
                          badge: bundleBadgeBn.trim() || 'Combo Deal',
                          badgeBn: bundleBadgeBn.trim() || 'স্পেশাল কম্বো'
                        };
                        if (editingBundleId) {
                          updateSettings({
                            bundles: currentBundles.map(item => item.id === editingBundleId ? bundlePayload : item)
                          });
                        } else {
                          updateSettings({ bundles: [bundlePayload, ...currentBundles] });
                        }
                        setEditingBundleId(null);
                        setBundleNameBn('');
                        setBundleNameEn('');
                        setBundleTaglineBn('');
                        setSelectedBundleBooks([]);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 2500);
                      }}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200">
                          {editingBundleId
                            ? (language === 'bn' ? 'বান্ডেল সম্পাদনা করুন' : 'Editing Combo Bundle')
                            : (language === 'bn' ? 'নতুন কম্বো বান্ডেল যোগ করুন' : 'Create New Combo Bundle')}
                        </h5>
                        {editingBundleId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBundleId(null);
                              setBundleNameBn('');
                              setBundleNameEn('');
                              setBundleTaglineBn('');
                              setSelectedBundleBooks([]);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                          >
                            {language === 'bn' ? 'বাতিল' : 'Cancel Edit'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          value={bundleNameBn}
                          onChange={(e) => setBundleNameBn(e.target.value)}
                          placeholder={language === 'bn' ? 'বান্ডেলের নাম (বাংলা) *' : 'Bundle Name (Bangla) *'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={bundleTaglineBn}
                          onChange={(e) => setBundleTaglineBn(e.target.value)}
                          placeholder={language === 'bn' ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Short Tagline'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={bundleBadgeBn}
                          onChange={(e) => setBundleBadgeBn(e.target.value)}
                          placeholder={language === 'bn' ? 'ব্যাজ (যেমন: ২৫০ টাকা সাশ্রয়)' : 'Badge Text'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                            {language === 'bn' ? 'রেগুলার মূল্য (৳)' : 'Original Total Price (BDT)'}
                          </label>
                          <input
                            type="number"
                            value={bundleOrigPrice}
                            onChange={(e) => setBundleOrigPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-emerald-600 block mb-1">
                            {language === 'bn' ? 'বান্ডেল অফার মূল্য (৳) *' : 'Discounted Bundle Price (BDT) *'}
                          </label>
                          <input
                            type="number"
                            required
                            value={bundlePrice}
                            onChange={(e) => setBundlePrice(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                      </div>

                      {/* Select Books Checkboxes */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                          {language === 'bn' ? 'বান্ডেলে অন্তর্ভুক্ত বইগুলো সিলেক্ট করুন:' : 'Select E-Books to Include:'}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ebooks.map(b => {
                            const checked = selectedBundleBooks.includes(b.id);
                            return (
                              <label
                                key={b.id}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer flex items-center gap-1.5 ${
                                  checked
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBundleBooks(prev => [...prev, b.id]);
                                    } else {
                                      setSelectedBundleBooks(prev => prev.filter(id => id !== b.id));
                                    }
                                  }}
                                  className="accent-emerald-600"
                                />
                                <span>{language === 'bn' && b.titleBn ? b.titleBn : b.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                        >
                          {editingBundleId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>
                            {editingBundleId
                              ? (language === 'bn' ? 'বান্ডেল আপডেট করুন' : 'Update Bundle')
                              : (language === 'bn' ? 'বান্ডেল যোগ করুন' : 'Add Combo Bundle')}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Existing Bundles List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(settings.bundles || DEFAULT_STORE_SETTINGS.bundles || []).map(b => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-amber-600 uppercase block">{b.badgeBn || b.badge}</span>
                            <h5 className="font-bold text-slate-900 dark:text-white truncate">{b.nameBn || b.name}</h5>
                            <p className="text-[11px] text-emerald-600 font-bold">
                              ৳{b.bundlePrice} <span className="line-through text-slate-400 font-normal">৳{b.originalPrice}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBundleId(b.id);
                                setBundleNameBn(b.nameBn || b.name);
                                setBundleNameEn(b.name);
                                setBundleTaglineBn(b.taglineBn || b.tagline);
                                setBundleBadgeBn(b.badgeBn || b.badge || '');
                                setBundleOrigPrice(b.originalPrice);
                                setBundlePrice(b.bundlePrice);
                                setSelectedBundleBooks(b.bookIds || []);
                              }}
                              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="Edit Bundle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = settings.bundles || DEFAULT_STORE_SETTINGS.bundles || [];
                                updateSettings({ bundles: current.filter(item => item.id !== b.id) });
                              }}
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                              title="Delete Bundle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. FAQ ACCORDION MANAGER */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'bn' ? '২. সাধারণ প্রশ্নোত্তর (FAQ) ম্যানেজার' : '2. FAQ Questions & Answers Manager'}</span>
                      </h4>
                    </div>

                    {/* Add / Edit FAQ Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!faqQBn.trim() || !faqABn.trim()) return;
                        const currentFaqs = settings.faqs || DEFAULT_STORE_SETTINGS.faqs || [];
                        const faqPayload: FAQEntry = {
                          id: editingFaqId || `faq-${Date.now()}`,
                          questionBn: faqQBn.trim(),
                          question: faqQEn.trim() || faqQBn.trim(),
                          answerBn: faqABn.trim(),
                          answer: faqAEn.trim() || faqABn.trim()
                        };
                        if (editingFaqId) {
                          updateSettings({
                            faqs: currentFaqs.map(item => item.id === editingFaqId ? faqPayload : item)
                          });
                        } else {
                          updateSettings({ faqs: [...currentFaqs, faqPayload] });
                        }
                        setEditingFaqId(null);
                        setFaqQBn('');
                        setFaqQEn('');
                        setFaqABn('');
                        setFaqAEn('');
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 2500);
                      }}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200">
                          {editingFaqId
                            ? (language === 'bn' ? 'প্রশ্নোত্তর সম্পাদনা করুন' : 'Editing FAQ Item')
                            : (language === 'bn' ? 'নতুন প্রশ্নোত্তর যোগ করুন' : 'Add New FAQ Item')}
                        </h5>
                        {editingFaqId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFaqId(null);
                              setFaqQBn('');
                              setFaqQEn('');
                              setFaqABn('');
                              setFaqAEn('');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                          >
                            {language === 'bn' ? 'বাতিল' : 'Cancel Edit'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={faqQBn}
                          onChange={(e) => setFaqQBn(e.target.value)}
                          placeholder={language === 'bn' ? 'প্রশ্ন (বাংলা) *' : 'Question (Bangla) *'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={faqQEn}
                          onChange={(e) => setFaqQEn(e.target.value)}
                          placeholder={language === 'bn' ? 'প্রশ্ন (English - ঐচ্ছিক)' : 'Question (English - Optional)'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={faqABn}
                        onChange={(e) => setFaqABn(e.target.value)}
                        placeholder={language === 'bn' ? 'উত্তর (বাংলা) *' : 'Answer (Bangla) *'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                        >
                          {editingFaqId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>
                            {editingFaqId
                              ? (language === 'bn' ? 'প্রশ্নোত্তর আপডেট করুন' : 'Update FAQ')
                              : (language === 'bn' ? 'প্রশ্নোত্তর যোগ করুন' : 'Add FAQ')}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Existing FAQs List */}
                    <div className="space-y-2">
                      {(settings.faqs || DEFAULT_STORE_SETTINGS.faqs || []).map((f) => (
                        <div
                          key={f.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h6 className="font-bold text-slate-900 dark:text-white">{f.questionBn || f.question}</h6>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{f.answerBn || f.answer}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFaqId(f.id);
                                setFaqQBn(f.questionBn || f.question);
                                setFaqQEn(f.question);
                                setFaqABn(f.answerBn || f.answer);
                                setFaqAEn(f.answer);
                              }}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = settings.faqs || DEFAULT_STORE_SETTINGS.faqs || [];
                                updateSettings({ faqs: current.filter(item => item.id !== f.id) });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. CUSTOMER REVIEWS MODERATION */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{language === 'bn' ? `৩. পাঠকদের রিভিউ ও ৫-স্টার রেটিং নিয়ন্ত্রণ (${reviews.length})` : `3. Customer Reviews Moderation (${reviews.length})`}</span>
                      </h4>
                    </div>

                    {/* Add / Edit Verified Review Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!revNameBn.trim() || !revCommentBn.trim()) return;
                        if (editingReviewId) {
                          updateReview(editingReviewId, {
                            name: revNameBn.trim(),
                            nameBn: revNameBn.trim(),
                            role: revRoleBn.trim() || 'Verified Reader',
                            roleBn: revRoleBn.trim() || 'যাচাইকৃত পাঠক',
                            rating: revRating,
                            comment: revCommentBn.trim(),
                            commentBn: revCommentBn.trim(),
                            bookTitle: revBookBn,
                            bookTitleBn: revBookBn
                          });
                        } else {
                          addReview({
                            id: `rev-${Date.now()}`,
                            name: revNameBn.trim(),
                            nameBn: revNameBn.trim(),
                            role: revRoleBn.trim() || 'Verified Reader',
                            roleBn: revRoleBn.trim() || 'যাচাইকৃত পাঠক',
                            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                            rating: revRating,
                            comment: revCommentBn.trim(),
                            commentBn: revCommentBn.trim(),
                            bookTitle: revBookBn,
                            bookTitleBn: revBookBn,
                            verified: true,
                            date: 'যাচাইকৃত'
                          });
                        }
                        setEditingReviewId(null);
                        setRevNameBn('');
                        setRevCommentBn('');
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 2500);
                      }}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-800 dark:text-slate-200">
                          {editingReviewId
                            ? (language === 'bn' ? 'রিভিউ সম্পাদনা করুন' : 'Editing Customer Review')
                            : (language === 'bn' ? 'নতুন ভেরিফাইড রিভিউ যোগ করুন' : 'Add Verified Customer Review')}
                        </h5>
                        {editingReviewId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReviewId(null);
                              setRevNameBn('');
                              setRevCommentBn('');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                          >
                            {language === 'bn' ? 'বাতিল' : 'Cancel Edit'}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          value={revNameBn}
                          onChange={(e) => setRevNameBn(e.target.value)}
                          placeholder={language === 'bn' ? 'পাঠকের নাম *' : 'Reader Name *'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={revRoleBn}
                          onChange={(e) => setRevRoleBn(e.target.value)}
                          placeholder={language === 'bn' ? 'পেশা / পরিচয়' : 'Role / Profession'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={revBookBn}
                          onChange={(e) => setRevBookBn(e.target.value)}
                          placeholder={language === 'bn' ? 'বইয়ের নাম' : 'Book Title'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={revCommentBn}
                        onChange={(e) => setRevCommentBn(e.target.value)}
                        placeholder={language === 'bn' ? 'রিভিউ মন্তব্য লিখুন *' : 'Review Comment *'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 mr-1">Rating:</span>
                          {[1, 2, 3, 4, 5].map(st => (
                            <button
                              type="button"
                              key={st}
                              onClick={() => setRevRating(st)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${st <= revRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                        >
                          {editingReviewId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>
                            {editingReviewId
                              ? (language === 'bn' ? 'রিভিউ আপডেট করুন' : 'Update Review')
                              : (language === 'bn' ? 'রিভিউ যোগ করুন' : 'Publish Review')}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Existing Reviews List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reviews.map(r => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{r.nameBn || r.name}</span>
                              <span className="text-[10px] text-amber-500 font-bold">★ {r.rating}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">&quot;{r.commentBn || r.comment}&quot;</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(r.id);
                                setRevNameBn(r.nameBn || r.name);
                                setRevRoleBn(r.roleBn || r.role);
                                setRevBookBn(r.bookTitleBn || r.bookTitle);
                                setRevCommentBn(r.commentBn || r.comment);
                                setRevRating(r.rating);
                              }}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="Edit Review"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteReview(r.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. LIVE SALES POPUP NOTIFICATIONS MANAGER */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          <span>{language === 'bn' ? '৪. লাইভ সেলস সোশ্যাল প্রুফ পপআপ ম্যানেজার' : '4. Live Sales Notification Popup Items'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {language === 'bn'
                            ? 'স্ক্রিনের নিচে কোণায় "হাসিব এইমাত্র বইটি কিনলেন" নোটিফিকেশনে কাদের নাম ও জেলা দেখাবে তা নিয়ন্ত্রণ করুন।'
                            : 'Customize the buyer notifications that cycle in the bottom-left corner.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('kitabghar:trigger-live-sale-toast'));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-200 transition-colors shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'পপআপ টেস্ট করুন' : 'Preview Popup Now'}</span>
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!saleBuyerBn.trim() || !saleBookBn.trim()) return;
                        const currentSales = settings.liveSales || DEFAULT_STORE_SETTINGS.liveSales || [];
                        const salePayload: LiveSaleItem = {
                          id: editingSaleId || `sale-${Date.now()}`,
                          buyerName: saleBuyerBn.trim(),
                          buyerNameBn: saleBuyerBn.trim(),
                          district: saleDistrictBn.trim() || 'Dhaka',
                          districtBn: saleDistrictBn.trim() || 'ঢাকা',
                          bookTitle: saleBookBn.trim(),
                          bookTitleBn: saleBookBn.trim(),
                          timeAgo: saleTimeBn.trim() || '5 mins ago',
                          timeAgoBn: saleTimeBn.trim() || '৫ মিনিট আগে'
                        };
                        if (editingSaleId) {
                          updateSettings({
                            liveSales: currentSales.map(s => s.id === editingSaleId ? salePayload : s)
                          });
                        } else {
                          updateSettings({ liveSales: [salePayload, ...currentSales] });
                        }
                        setEditingSaleId(null);
                        setSaleBuyerBn('');
                        setSaleDistrictBn('');
                        setSaleBookBn('');
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 2500);
                      }}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <input
                          type="text"
                          required
                          value={saleBuyerBn}
                          onChange={(e) => setSaleBuyerBn(e.target.value)}
                          placeholder={language === 'bn' ? 'ক্রেতার নাম (যেমন: রাকিব হাসান) *' : 'Buyer Name *'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={saleDistrictBn}
                          onChange={(e) => setSaleDistrictBn(e.target.value)}
                          placeholder={language === 'bn' ? 'এলাকা/জেলা (যেমন: ধানমন্ডি, ঢাকা)' : 'Location / District'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          required
                          value={saleBookBn}
                          onChange={(e) => setSaleBookBn(e.target.value)}
                          placeholder={language === 'bn' ? 'কেনা বইয়ের নাম *' : 'Purchased Book Title *'}
                          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                        >
                          {editingSaleId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>
                            {editingSaleId
                              ? (language === 'bn' ? 'পপআপ আপডেট' : 'Update Toast')
                              : (language === 'bn' ? 'পপআপ যোগ করুন' : 'Add Notification')}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Existing Live Sales List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {(settings.liveSales || DEFAULT_STORE_SETTINGS.liveSales || []).map(item => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {item.buyerNameBn || item.buyerName} ({item.districtBn || item.district})
                            </span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block truncate">
                              {item.bookTitleBn || item.bookTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSaleId(item.id);
                                setSaleBuyerBn(item.buyerNameBn || item.buyerName);
                                setSaleDistrictBn(item.districtBn || item.district);
                                setSaleBookBn(item.bookTitleBn || item.bookTitle);
                                setSaleTimeBn(item.timeAgoBn || item.timeAgo);
                              }}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                              title="Edit Notification"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = settings.liveSales || DEFAULT_STORE_SETTINGS.liveSales || [];
                                updateSettings({ liveSales: current.filter(s => s.id !== item.id) });
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                              title="Remove Notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
