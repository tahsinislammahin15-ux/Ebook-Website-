import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BookCard } from './components/BookCard';
import { ReaderModal } from './components/ReaderModal';
import { WhatsAppCheckoutModal } from './components/WhatsAppCheckoutModal';
import { AdminModal } from './components/AdminModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DynamicSEO } from './components/DynamicSEO';
import { FAQSection } from './components/FAQSection';
import { LiveSalesNotification } from './components/LiveSalesNotification';
import { FlashSaleBanner } from './components/FlashSaleBanner';
import { ReadingResumeBanner } from './components/ReadingResumeBanner';
import { ComboDealsSection } from './components/ComboDealsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { DownloadGiftModal } from './components/DownloadGiftModal';
import { AuthorStorySection } from './components/AuthorStorySection';
import { BookX } from 'lucide-react';

function StorefrontContent() {
  const { ebooks, language, t, openAdmin } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'pages-desc' | 'title'>('featured');

  // Secret Admin Access Listeners:
  // 1. Keyboard Shortcut: Ctrl + Shift + A
  // 2. URL parameter: ?admin or #admin
  React.useEffect(() => {
    // Check URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('admin') || window.location.hash === '#admin') {
      openAdmin();
    }

    // Keyboard shortcut handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdmin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAdmin]);

  // Derive unique categories
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    ebooks.forEach(b => {
      if (b.category) {
        const label = language === 'bn' && b.categoryBn ? b.categoryBn : b.category;
        map.set(b.category, label);
      }
    });
    return Array.from(map.entries());
  }, [ebooks, language]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...ebooks];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => {
        const titleEn = b.title.toLowerCase();
        const titleBn = (b.titleBn || '').toLowerCase();
        const authorEn = b.author.toLowerCase();
        const authorBn = (b.authorBn || '').toLowerCase();
        const catEn = b.category.toLowerCase();
        const catBn = (b.categoryBn || '').toLowerCase();
        const descEn = b.shortDescription.toLowerCase();
        const descBn = (b.shortDescriptionBn || '').toLowerCase();

        return (
          titleEn.includes(q) ||
          titleBn.includes(q) ||
          authorEn.includes(q) ||
          authorBn.includes(q) ||
          catEn.includes(q) ||
          catBn.includes(q) ||
          descEn.includes(q) ||
          descBn.includes(q)
        );
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(b => b.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(b => b.category === categoryFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'pages-desc') return b.pages - a.pages;
      if (sortBy === 'title') {
        const titleA = language === 'bn' && a.titleBn ? a.titleBn : a.title;
        const titleB = language === 'bn' && b.titleBn ? b.titleBn : b.title;
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

    return result;
  }, [ebooks, searchQuery, typeFilter, categoryFilter, sortBy, language]);

  const handleSelectNavCategory = (filter: string) => {
    if (filter === 'free' || filter === 'paid' || filter === 'all') {
      setTypeFilter(filter as 'all' | 'free' | 'paid');
      setCategoryFilter('all');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-20 lg:pb-0">
      {/* Dynamic SEO & Social Share Metadata Management */}
      <DynamicSEO />

      {/* 1. Live Countdown Flash Sale Banner */}
      <FlashSaleBanner />

      {/* Top Navigation Bar */}
      <Header onSelectCategory={handleSelectNavCategory} activeFilter={typeFilter} />

      {/* 2. Personalized Reading History & Resume Strip */}
      <ReadingResumeBanner />

      {/* Hero Section */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExploreFree={() => {
          setTypeFilter('free');
          setCategoryFilter('all');
          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExplorePaid={() => {
          setTypeFilter('paid');
          setCategoryFilter('all');
          document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Viewport */}
      <main id="catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Filter & Sort Controls Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          
          {/* Segmented Controls for Type Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.allFilter(ebooks.length)}
            </button>
            <button
              onClick={() => setTypeFilter('free')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                typeFilter === 'free'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.freeFilter(ebooks.filter(b => b.type === 'free').length)}
            </button>
            <button
              onClick={() => setTypeFilter('paid')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                typeFilter === 'paid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.paidFilter(ebooks.filter(b => b.type === 'paid').length)}
            </button>
          </div>

          {/* Category Dropdown & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">{t.categoryLabel}</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">{t.sortLabel}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="featured">{t.sortFeatured}</option>
                <option value="price-asc">{t.sortPriceAsc}</option>
                <option value="price-desc">{t.sortPriceDesc}</option>
                <option value="pages-desc">{t.sortPagesDesc}</option>
                <option value="title">{t.sortTitle}</option>
              </select>
            </div>

          </div>

        </div>

        {/* Results Metadata & Clear Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>{t.showingResults(filteredBooks.length)}</span>
            {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all') && (
              <span> {t.withActiveFilters}</span>
            )}
          </div>

          {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              {t.resetFilters}
            </button>
          )}
        </div>

        {/* E-Book Grid Showcase (3-column desktop baseline) */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <BookX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.noBooksFound}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.noBooksDesc}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg shadow-xs"
            >
              <span>{t.viewAllBooks}</span>
            </button>
          </div>
        )}

      </main>

      {/* 3. Combo Bundle Deals Section */}
      <ComboDealsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* 4. Customer Verified Reviews & 5-Star Ratings */}
      <ReviewsSection />

      {/* 5. Author & Founder Trust Story Section */}
      <AuthorStorySection />

      {/* FAQ (Frequently Asked Questions) Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Live Sales Proof Floating Notification */}
      <LiveSalesNotification />

      {/* Mobile Sticky Thumb Navigation (Active on Mobile & Tablet viewports) */}
      <MobileBottomNav onSelectCategory={handleSelectNavCategory} activeFilter={typeFilter} />

      {/* Interactive Modals & Drawers */}
      <ReaderModal />
      <WhatsAppCheckoutModal />
      <AdminModal />
      <WishlistDrawer />
      <DownloadGiftModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StorefrontContent />
    </StoreProvider>
  );
}
