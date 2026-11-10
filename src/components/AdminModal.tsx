import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Ebook } from '../types/ebook';
import { 
  X, Shield, Lock, Plus, Edit2, Trash2, Download, Save, 
  RotateCcw, Check, AlertCircle, FileCode, Smartphone, BookOpen, Layers,
  LogOut, Eye, EyeOff, User, KeyRound, Clock
} from 'lucide-react';

const LOCKOUT_KEY = 'kitabghor_admin_lockout';
const ATTEMPTS_KEY = 'kitabghor_admin_failed_attempts';
const SESSION_KEY = 'kitabghor_admin_session_auth';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export const AdminModal: React.FC = () => {
  const { 
    isAdminOpen, closeAdmin, ebooks, settings, 
    addEbook, updateEbook, deleteEbook, updateSettings, 
    exportProductsJSON, resetCatalog, language 
  } = useStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Rate limiting & lockout state
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(ATTEMPTS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'books' | 'settings' | 'cpanel'>('books');
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = sessionStorage.getItem(LOCKOUT_KEY);
        if (lockoutUntil) {
          const diff = parseInt(lockoutUntil, 10) - Date.now();
          if (diff > 0) {
            setLockoutRemaining(Math.ceil(diff / 1000));
          } else {
            setLockoutRemaining(0);
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

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passcodeInput.trim();

    // Valid identifiers allowed for owner:
    const validUsernames = [
      (settings.adminUsername || 'tahsinislam').toLowerCase(),
      'tahsin',
      'tahsinislam',
      'tahsinislammahin15@gmail.com'
    ];

    const isUserValid = validUsernames.includes(cleanUser);
    const isPassValid = cleanPass === (settings.adminPasscode || 'tahsinislam4567');

    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      setAuthError('');
      setFailedAttempts(0);
      sessionStorage.removeItem(ATTEMPTS_KEY);
      sessionStorage.removeItem(LOCKOUT_KEY);
      sessionStorage.setItem(SESSION_KEY, 'authenticated');
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      sessionStorage.setItem(ATTEMPTS_KEY, nextAttempts.toString());

      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
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
    sessionStorage.removeItem(SESSION_KEY);
    setUsernameInput('');
    setPasscodeInput('');
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
    if (!bookForm.title || !bookForm.author) {
      alert(language === 'bn' ? 'অনুগ্রহ করে বইয়ের নাম ও লেখক দিন।' : 'Please provide at least a title and author.');
      return;
    }

    const payload: Omit<Ebook, 'id'> = {
      title: bookForm.title || 'Untitled Ebook',
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
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. tahsinislam"
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
              <p>{language === 'bn' ? 'সর্বোচ্চ ৩টি প্রচেষ্টার সুযোগ দেওয়া হবে।' : 'Maximum 3 attempts before temporary lockout.'}</p>
              <p className="text-slate-400/80">
                {language === 'bn' 
                  ? 'শর্টকাট: কিবোর্ডে Ctrl + Shift + A চেপে এই প্যানেল খুলতে পারবেন।' 
                  : 'Quick toggle: Ctrl + Shift + A'}
              </p>
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
                  <span>{language === 'bn' ? `ই-বুক তালিকা (${ebooks.length})` : `E-Books (${ebooks.length})`}</span>
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
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ ও বিকাশ নম্বর' : 'WhatsApp & Wallets'}</span>
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
                  <span>{language === 'bn' ? 'সিপ্যানেল গাইড ও এক্সপোর্ট' : 'cPanel Guide & Export'}</span>
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
                                  onClick={() => handleStartEdit(book)}
                                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(language === 'bn' ? `"${displayTitle}" বইটি কি মুছে ফেলতে চান?` : `Delete "${book.title}" from catalog?`)) {
                                      deleteEbook(book.id);
                                    }
                                  }}
                                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
                          onClick={() => {
                            if (confirm(language === 'bn' ? 'ক্যাটালগ রিসেট করতে চান?' : 'Reset catalog back to initial default books?')) {
                              resetCatalog();
                            }
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{language === 'bn' ? 'ডিফল্ট বইগুলোতে রিসেট করুন' : 'Reset to Default Books'}</span>
                        </button>
                        <span className="text-xs text-slate-400">
                          {language === 'bn' ? 'সিপ্যানেলে আপলোডের জন্য Export products.json চাপুন।' : 'Export products.json when ready for cPanel.'}
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
                          onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">স্টোরের নাম (বাংলা)</label>
                        <input
                          type="text"
                          value={settingsForm.storeNameBn}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storeNameBn: e.target.value })}
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
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
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
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappDisplayNumber: e.target.value })}
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
                          onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-800 font-mono text-xs"
                        />
                        <select
                          value={settingsForm.bkashType}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bkashType: e.target.value as 'Personal' | 'Merchant' })}
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
                          onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 font-mono text-xs"
                        />
                        <select
                          value={settingsForm.nagadType}
                          onChange={(e) => setSettingsForm({ ...settingsForm, nagadType: e.target.value as 'Personal' | 'Merchant' })}
                          className="w-full px-2 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800 text-xs"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Security Credentials Setting */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                      {language === 'bn' ? 'এডমিন লগইন নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন' : 'Admin Security Credentials'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Admin Username</label>
                        <input
                          type="text"
                          value={settingsForm.adminUsername || 'tahsinislam'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminUsername: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">Admin Password</label>
                        <input
                          type="password"
                          value={settingsForm.adminPasscode || 'tahsinislam4567'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminPasscode: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
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

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
