import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, Bookmark, Trash2, Download, MessageSquareText, Eye, 
  ArrowRight, BookOpen, Sparkles 
} from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const { 
    isWishlistOpen, closeWishlist, wishlist, ebooks, 
    toggleWishlist, clearWishlist, openReader, openCheckout, 
    generateEbookDownload, settings, language, t 
  } = useStore();

  if (!isWishlistOpen) return null;

  // Filter books that are in the wishlist
  const savedBooks = ebooks.filter(b => wishlist.includes(b.id));

  // Compute total price of paid items in wishlist
  const totalPaidPrice = savedBooks
    .filter(b => b.type === 'paid')
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeWishlist}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slideLeft">
          
          {/* Header */}
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Bookmark className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t.wishlistTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.savedItems(savedBooks.length)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedBooks.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(language === 'bn' ? 'সব বই কি তালিকা থেকে মুছে ফেলতে চান?' : 'Clear all books from wishlist?')) {
                      clearWishlist();
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors p-1.5"
                  title={t.clearWishlist}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeWishlist}
                aria-label="Close wishlist"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {savedBooks.length > 0 ? (
              <div className="space-y-4">
                {savedBooks.map((book) => {
                  const title = language === 'bn' && book.titleBn ? book.titleBn : book.title;
                  const author = language === 'bn' && book.authorBn ? book.authorBn : book.author;
                  const category = language === 'bn' && book.categoryBn ? book.categoryBn : book.category;
                  const isFree = book.type === 'free';

                  return (
                    <div 
                      key={book.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex gap-3.5"
                    >
                      {/* Cover thumbnail */}
                      <div 
                        className="w-14 h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 cursor-pointer shadow-xs"
                        onClick={() => {
                          closeWishlist();
                          openReader(book);
                        }}
                      >
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              {category}
                            </span>
                            <button
                              onClick={() => toggleWishlist(book.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5"
                              title={t.removeFromWishlist}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h3 
                            onClick={() => {
                              closeWishlist();
                              openReader(book);
                            }}
                            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-600 transition-colors"
                            title={title}
                          >
                            {title}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {author}
                          </p>
                        </div>

                        {/* Price & Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <div>
                            {isFree ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {t.freeBadge}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                                {settings.currencySymbol} {book.price}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                closeWishlist();
                                openReader(book);
                              }}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title={t.readSample}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isFree ? (
                              <button
                                onClick={() => generateEbookDownload(book)}
                                className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{t.downloadBtn}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  closeWishlist();
                                  openCheckout(book);
                                }}
                                className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs active:scale-95"
                              >
                                <MessageSquareText className="w-3.5 h-3.5" />
                                <span>{t.buyWhatsAppBtn}</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="py-20 text-center max-w-xs mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                  <Bookmark className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.emptyWishlist}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.emptyWishlistDesc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeWishlist();
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  <span>{t.exploreBooks}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Summary (if items exist) */}
          {savedBooks.length > 0 && (
            <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 shrink-0 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t.totalValue}</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {settings.currencySymbol} {totalPaidPrice} BDT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {language === 'bn'
                  ? 'আপনার পছন্দের বইগুলো ব্রাউজারে সংরক্ষিত থাকবে।'
                  : 'Items remain saved in your browser localStorage.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
