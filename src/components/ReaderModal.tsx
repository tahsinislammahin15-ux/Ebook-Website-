import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, BookOpen, Download, MessageSquareText, FileText, CheckCircle2, Bookmark } from 'lucide-react';

export const ReaderModal: React.FC = () => {
  const { 
    activeReaderBook, closeReader, openCheckout, generateEbookDownload, 
    settings, language, t, toggleWishlist, isInWishlist 
  } = useStore();
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [paperTheme, setPaperTheme] = useState<'clean' | 'warm' | 'dark'>('clean');

  if (!activeReaderBook) return null;

  const isFree = activeReaderBook.type === 'free';
  const isSaved = isInWishlist(activeReaderBook.id);
  const title = language === 'bn' && activeReaderBook.titleBn ? activeReaderBook.titleBn : activeReaderBook.title;
  const author = language === 'bn' && activeReaderBook.authorBn ? activeReaderBook.authorBn : activeReaderBook.author;
  const desc = language === 'bn' && activeReaderBook.descriptionBn ? activeReaderBook.descriptionBn : activeReaderBook.description;
  const excerpt = language === 'bn' && activeReaderBook.previewExcerptBn ? activeReaderBook.previewExcerptBn : activeReaderBook.previewExcerpt;
  const toc = language === 'bn' && activeReaderBook.tableOfContentsBn ? activeReaderBook.tableOfContentsBn : activeReaderBook.tableOfContents;

  const fontClass = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
  }[fontSize];

  const themeClass = {
    clean: 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100',
    warm: 'bg-[#FAF7F2] text-[#2C2825] dark:bg-[#1E1B18] dark:text-[#EADFD5]',
    dark: 'bg-slate-950 text-slate-200 border-slate-800',
  }[paperTheme];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] ${themeClass} transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull/Drag Affordance Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Control Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <span>{t.byAuthor(author)}</span>
                <span aria-hidden="true">·</span>
                <span>{t.sampleReader}</span>
              </div>
            </div>
          </div>

          {/* Reader Preferences & Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bookmark Wishlist Button */}
            <button
              onClick={() => toggleWishlist(activeReaderBook.id)}
              className={`min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors ${
                isSaved
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? t.removeFromWishlist : t.addToWishlist}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Font Size Selector (Visible on Mobile & Desktop) */}
            <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 min-h-[32px] rounded transition-colors ${fontSize === 'sm' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 min-h-[32px] rounded transition-colors ${fontSize === 'base' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                title="Standard text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 min-h-[32px] rounded transition-colors ${fontSize === 'lg' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Paper Theme Buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPaperTheme('clean')}
                className={`w-5 h-5 rounded-full border border-slate-300 bg-white ${paperTheme === 'clean' ? 'ring-2 ring-emerald-500' : ''}`}
                title="White"
              />
              <button
                onClick={() => setPaperTheme('warm')}
                className={`w-5 h-5 rounded-full border border-[#E0D8CB] bg-[#FAF7F2] ${paperTheme === 'warm' ? 'ring-2 ring-emerald-500' : ''}`}
                title="Warm Paper"
              />
              <button
                onClick={() => setPaperTheme('dark')}
                className={`w-5 h-5 rounded-full border border-slate-700 bg-slate-950 ${paperTheme === 'dark' ? 'ring-2 ring-emerald-500' : ''}`}
                title="Night"
              />
            </div>

            <button
              onClick={closeReader}
              aria-label="Close reader"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
          
          {/* Book Quick Spec Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block mb-0.5">{t.length}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{t.pagesCount(activeReaderBook.pages)}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block mb-0.5">{t.format}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{activeReaderBook.format}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block mb-0.5">{t.language}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{activeReaderBook.language}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block mb-0.5">{t.delivery}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {isFree ? t.instantDownload : t.whatsappDelivery}
              </span>
            </div>
          </div>

          {/* Book Overview */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              {t.aboutPublication}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Table of Contents */}
          <div className="space-y-3 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>{t.tocTitle}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {toc.map((chapter, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{chapter}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Excerpt Prose */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                {t.chapter1Excerpt}
              </h3>
              <span className="text-xs text-slate-400">{t.samplePreviewBadge}</span>
            </div>

            <div className={`whitespace-pre-line ${fontClass} tracking-normal leading-relaxed`}>
              {excerpt}
            </div>
          </div>

        </div>

        {/* Bottom Contiguous Action Bar */}
        <div className="p-4 sm:px-8 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-baseline gap-2">
            {isFree ? (
              <div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{t.freeBookLabel}</span>
                <span className="text-xs text-slate-500 block">{t.freeBookSubtext}</span>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {settings.currencySymbol} {activeReaderBook.price}
                </span>
                <span className="text-xs text-slate-500 block">{t.payViaWallets}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isFree ? (
              <button
                onClick={() => {
                  generateEbookDownload(activeReaderBook);
                  closeReader();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadFreeEbook}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  const book = activeReaderBook;
                  closeReader();
                  openCheckout(book);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm active:scale-98"
              >
                <MessageSquareText className="w-4 h-4" />
                <span>{t.buyNowWhatsApp(settings.currencySymbol, activeReaderBook.price)}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
