import React from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Download, MessageSquareText, ShieldCheck } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExploreFree: () => void;
  onExplorePaid: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  onExploreFree,
  onExplorePaid
}) => {
  const { ebooks, t } = useStore();
  const freeCount = ebooks.filter(b => b.type === 'free').length;
  const paidCount = ebooks.filter(b => b.type === 'paid').length;

  return (
    <section className="relative overflow-hidden pt-10 pb-12 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-slate-100/70 to-white dark:from-slate-900/50 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          
          {/* Subtitle / trust label without pill capsules */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span>{t.trust1}</span>
            <span aria-hidden="true">·</span>
            <span>{t.trust2}</span>
            <span aria-hidden="true">·</span>
            <span>{t.trust3}</span>
          </div>

          {/* Primary Headline with balance */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>

          {/* Live Search Input */}
          <div className="max-w-xl mx-auto relative pt-1">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-14 py-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium px-2 py-1"
                >
                  {t.clearSearch}
                </button>
              )}
            </div>
          </div>

          {/* Quick CTA Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={onExploreFree}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.browseFreeCount(freeCount)}</span>
            </button>
            <button
              onClick={onExplorePaid}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>{t.paidViaWhatsAppCount(paidCount)}</span>
            </button>
          </div>

          {/* Minimal 3-Point Trust Strip */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80 dark:border-slate-800 text-left">
            <div className="flex items-start gap-2.5 p-2">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">{t.trustCard1Title}</span>
                <span className="text-slate-500 dark:text-slate-400">{t.trustCard1Desc}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2">
              <MessageSquareText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">{t.trustCard2Title}</span>
                <span className="text-slate-500 dark:text-slate-400">{t.trustCard2Desc}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">{t.trustCard3Title}</span>
                <span className="text-slate-500 dark:text-slate-400">{t.trustCard3Desc}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
