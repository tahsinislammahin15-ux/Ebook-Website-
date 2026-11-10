import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sun, Moon, Shield, BookOpen, Languages, Bookmark } from 'lucide-react';

interface HeaderProps {
  onSelectCategory: (category: string) => void;
  activeFilter: string;
}

export const Header: React.FC<HeaderProps> = ({ onSelectCategory, activeFilter }) => {
  const { 
    settings, darkMode, toggleDarkMode, openAdmin, 
    language, toggleLanguage, t, wishlist, openWishlist 
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
        
        {/* Zone 1: Wordmark with Official KitabGhar Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('all');
            }}
            className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <img
                src={settings.logoUrl || "/assets/aistudio/1794301559714_e54adc4f.jpg"}
                alt="KitabGhar Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-extrabold">{language === 'bn' ? settings.storeNameBn : settings.storeName}</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block leading-none mt-0.5">
                {language === 'bn' ? 'Your Ultimate Book Home' : 'Your Ultimate Book Home'}
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: 4-5 single-line clean text nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors pb-0.5 ${
              activeFilter === 'all'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : ''
            }`}
          >
            {t.allEbooks}
          </button>
          <button
            onClick={() => onSelectCategory('free')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors pb-0.5 ${
              activeFilter === 'free'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : ''
            }`}
          >
            {t.freeDownloads}
          </button>
          <button
            onClick={() => onSelectCategory('paid')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors pb-0.5 ${
              activeFilter === 'paid'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                : ''
            }`}
          >
            {t.paidBooks}
          </button>
          <a
            href="#how-it-works"
            className="whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t.howItWorks}
          </a>
          <a
            href="#faq"
            className="whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {language === 'bn' ? 'সাধারণ প্রশ্ন' : 'FAQ'}
          </a>
          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
              language === 'bn'
                ? 'হ্যালো, বইঘর থেকে ই-বুক সম্পর্কে জানতে চাই।'
                : `Hello ${settings.storeName}, I have an inquiry about e-books.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap shrink-0 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-emerald-600 dark:text-emerald-400 font-medium"
          >
            {t.whatsappHelp}
          </a>
        </nav>

        {/* Zone 3: Wishlist + Language toggle + Dark Mode */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Wishlist Button with Counter */}
          <button
            onClick={openWishlist}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            title={t.wishlist}
            aria-label={t.wishlist}
          >
            <Bookmark className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-emerald-600 text-emerald-600' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="min-h-[44px] px-3 flex items-center gap-1.5 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors whitespace-nowrap active:scale-95"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
