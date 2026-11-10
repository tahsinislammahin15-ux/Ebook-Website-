import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookOpen, Download, MessageSquareText, Bookmark } from 'lucide-react';

interface MobileBottomNavProps {
  onSelectCategory: (filter: 'all' | 'free' | 'paid') => void;
  activeFilter: 'all' | 'free' | 'paid';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onSelectCategory,
  activeFilter
}) => {
  const { wishlist, openWishlist, settings, language, t } = useStore();

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        
        {/* Tab 1: All Ebooks */}
        <button
          onClick={() => {
            onSelectCategory('all');
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
            activeFilter === 'all'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight leading-none whitespace-nowrap">
            {language === 'bn' ? 'সব বই' : 'All Books'}
          </span>
        </button>

        {/* Tab 2: Free Ebooks */}
        <button
          onClick={() => {
            onSelectCategory('free');
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
            activeFilter === 'free'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight leading-none whitespace-nowrap">
            {language === 'bn' ? 'ফ্রি বই' : 'Free'}
          </span>
        </button>

        {/* Tab 3: Paid Ebooks */}
        <button
          onClick={() => {
            onSelectCategory('paid');
            document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors active:scale-95 ${
            activeFilter === 'paid'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquareText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight leading-none whitespace-nowrap">
            {language === 'bn' ? 'পেইড বই' : 'Paid'}
          </span>
        </button>

        {/* Tab 4: Wishlist */}
        <button
          onClick={openWishlist}
          className="min-h-[48px] flex flex-col items-center justify-center relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors active:scale-95"
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 mb-0.5 ${wishlist.length > 0 ? 'fill-emerald-600 text-emerald-600' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none whitespace-nowrap">
            {language === 'bn' ? 'পছন্দ' : 'Saved'}
          </span>
        </button>

        {/* Tab 5: WhatsApp Direct Help */}
        <a
          href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
            language === 'bn' ? 'হ্যালো, কিতাবঘর থেকে ই-বুক বিষয়ে সাহায্য চাই।' : 'Hello, I need assistance with an e-book on KitabGhar.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium active:scale-95"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-0.5">
            💬
          </span>
          <span className="text-[10px] tracking-tight leading-none whitespace-nowrap font-bold">
            {language === 'bn' ? 'হেল্প' : 'Help'}
          </span>
        </a>

      </div>
    </nav>
  );
};
