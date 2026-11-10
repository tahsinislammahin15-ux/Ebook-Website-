import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, BookOpen, Download, MessageSquareText, FileText, CheckCircle2, 
  Bookmark, ChevronLeft, ChevronRight, Layers, Volume2
} from 'lucide-react';

export const ReaderModal: React.FC = () => {
  const { 
    activeReaderBook, closeReader, openCheckout, generateEbookDownload, 
    settings, language, t, toggleWishlist, isInWishlist,
    updateReadingProgress, readingProgress
  } = useStore();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [paperTheme, setPaperTheme] = useState<'clean' | 'warm' | 'dark'>('clean');
  
  // Flipbook state: 0 = Cover/Overview, 1 = Table of Contents, 2 = Chapter 1 Sample, 3 = Chapter 2 Key Insights
  const [activePage, setActivePage] = useState<number>(0);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Initialize or resume saved page
  useEffect(() => {
    if (activeReaderBook) {
      const saved = readingProgress[activeReaderBook.id];
      if (saved && typeof saved.currentPage === 'number') {
        setActivePage(Math.min(3, saved.currentPage));
      } else {
        setActivePage(0);
      }
    }
  }, [activeReaderBook, readingProgress]);

  if (!activeReaderBook) return null;

  const totalFlipPages = 4; // 0, 1, 2, 3
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

  const handleTurnPage = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    setTurnDirection(direction);
    setIsFlipping(true);

    const nextPage = direction === 'next' 
      ? Math.min(totalFlipPages - 1, activePage + 1)
      : Math.max(0, activePage - 1);

    setTimeout(() => {
      setActivePage(nextPage);
      setIsFlipping(false);
      setTurnDirection(null);
      // Persist user's reading progress!
      updateReadingProgress(activeReaderBook.id, nextPage + 1, totalFlipPages);
    }, 280);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] ${themeClass} transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull/Drag Affordance Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Control Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
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
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {language === 'bn' ? `পৃষ্ঠা ${activePage + 1} / ${totalFlipPages}` : `Page ${activePage + 1} of ${totalFlipPages}`}
                </span>
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

            {/* Font Size Selector */}
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

        {/* 3D Realistic Page-Turn Reading Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          
          <div 
            className={`transition-all duration-300 ease-out transform ${
              isFlipping 
                ? turnDirection === 'next'
                  ? '-rotate-y-12 translate-x-3 opacity-60 scale-98 shadow-2xl'
                  : 'rotate-y-12 -translate-x-3 opacity-60 scale-98 shadow-2xl'
                : 'rotate-y-0 translate-x-0 opacity-100 scale-100'
            }`}
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
            {/* PAGE 0: Cover & Overview */}
            {activePage === 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="w-32 h-44 rounded-xl overflow-hidden shadow-lg shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={activeReaderBook.coverImage || '/assets/aistudio/1794301559714_e54adc4f.jpg'}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {activeReaderBook.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {language === 'bn' ? 'লেখক:' : 'By'} <strong>{author}</strong> · {activeReaderBook.pages} {language === 'bn' ? 'পৃষ্ঠা' : 'Pages'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 pt-1">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block mb-0.5">{t.length}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{t.pagesCount(activeReaderBook.pages)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">{t.format}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{activeReaderBook.format}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">{t.language}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{activeReaderBook.language}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">{t.delivery}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {isFree ? t.instantDownload : t.whatsappDelivery}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>{language === 'bn' ? '👉 পরবর্তী পাতায় সূচিপত্র ও নমুনা অংশ পড়তে নিচের "পরবর্তী পৃষ্ঠা" বাটনে ক্লিক করুন।' : '👉 Click "Next Page" below to preview Table of Contents & Chapter 1.'}</span>
                </div>
              </div>
            )}

            {/* PAGE 1: Table of Contents */}
            {activePage === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {language === 'bn' ? 'অধ্যায় তালিকা' : 'Page 2: Contents'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span>{t.tocTitle}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {toc.map((chapter, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3 text-xs sm:text-sm font-medium"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">{chapter}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
                  <p>{desc}</p>
                </div>
              </div>
            )}

            {/* PAGE 2: Chapter 1 Sample Excerpt */}
            {activePage === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {language === 'bn' ? 'নমুনা পাঠ' : 'Page 3: Sample Excerpt'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {t.chapter1Excerpt}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeReaderBook.fileSize}
                  </span>
                </div>

                <div className={`whitespace-pre-line ${fontClass} tracking-normal leading-relaxed p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800`}>
                  {excerpt}
                </div>
              </div>
            )}

            {/* PAGE 3: Key Takeaways & Full Access Call-to-action */}
            {activePage === 3 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'আপনি নমুনা অংশের শেষ পাতায় পৌঁছেছেন!' : 'You reached the end of preview!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'bn'
                      ? 'সম্পূর্ণ বইটিতে রয়েছে বিস্তারিত ব্যাখ্যা, প্র্যাক্টিক্যাল প্রজেক্ট কোড ও লাইফটাইম রিসোর্স এক্সেস।'
                      : 'The full e-book includes complete source codes, deep-dive architectures, and lifetime updates.'}
                  </p>
                </div>

                <div className="p-4 max-w-md mx-auto rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {isFree ? (language === 'bn' ? '১০০% ফ্রি ডিজিটাল কপি' : '100% Free Full Edition') : (language === 'bn' ? 'বিকাশ ও নগদে তাৎক্ষণিক অর্ডার' : 'Instant bKash/Nagad Order')}
                  </p>
                  <p className="text-slate-500">
                    {isFree ? (language === 'bn' ? 'নিচের ডাউনলোড বাটনে ক্লিক করে ডিভাইস এ সেভ করুন।' : 'Click download below to save to your device.') : (language === 'bn' ? 'অর্ডার পাঠানো মাত্রই হোয়াটসঅ্যাপে ডাউনলোড লিংক দেওয়া হবে।' : 'Get your Google Drive PDF link on WhatsApp in 2-10 mins.')}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Page Flip Navigation Bar */}
        <div className="px-6 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={activePage === 0}
            onClick={() => handleTurnPage('prev')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activePage === 0
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'আগের পৃষ্ঠা' : 'Previous'}</span>
          </button>

          {/* Page Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalFlipPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActivePage(idx);
                  updateReadingProgress(activeReaderBook.id, idx + 1, totalFlipPages);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  activePage === idx
                    ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`Go to page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={activePage === totalFlipPages - 1}
            onClick={() => handleTurnPage('next')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activePage === totalFlipPages - 1
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold cursor-pointer active:scale-95'
            }`}
          >
            <span>{language === 'bn' ? 'পরবর্তী পৃষ্ঠা' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
                  {settings.currencySymbol} {activeReaderBook.price} BDT
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm active:scale-98 cursor-pointer"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm active:scale-98 cursor-pointer"
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
