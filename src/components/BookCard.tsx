import React, { useState } from 'react';
import { Ebook } from '../types/ebook';
import { useStore } from '../context/StoreContext';
import { Download, MessageSquareText, Eye, BookOpen, Bookmark } from 'lucide-react';

interface BookCardProps {
  book: Ebook;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { 
    openReader, openCheckout, generateEbookDownload, 
    settings, language, t, toggleWishlist, isInWishlist 
  } = useStore();
  const [imageError, setImageError] = useState(false);
  const isFree = book.type === 'free';
  const isSaved = isInWishlist(book.id);

  const title = language === 'bn' && book.titleBn ? book.titleBn : book.title;
  const author = language === 'bn' && book.authorBn ? book.authorBn : book.author;
  const category = language === 'bn' && book.categoryBn ? book.categoryBn : book.category;
  const shortDesc = language === 'bn' && book.shortDescriptionBn ? book.shortDescriptionBn : book.shortDescription;

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      
      {/* Cover Image Container (3:4 aspect ratio) */}
      <div 
        className="relative aspect-3/4 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" 
        onClick={() => openReader(book)}
      >
        {!imageError && book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${title}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          /* Styled Fallback container */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-linear-to-br from-slate-800 to-slate-950 text-white">
            <BookOpen className="w-10 h-10 text-emerald-400 mb-3 opacity-80" />
            <h4 className="font-bold text-sm tracking-tight line-clamp-3 mb-1">{title}</h4>
            <p className="text-xs text-slate-400">{author}</p>
          </div>
        )}

        {/* Wishlist Bookmark Button (Top-left with 42px touch hit box) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(book.id);
          }}
          className={`absolute top-3 left-3 z-10 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl backdrop-blur-md transition-all shadow-xs active:scale-90 ${
            isSaved
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/50'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
          title={isSaved ? t.removeFromWishlist : t.addToWishlist}
          aria-label={isSaved ? t.removeFromWishlist : t.addToWishlist}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Free / Paid Type Chip (Top-right) */}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
              {t.freeBadge}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 shadow-xs backdrop-blur-xs">
              {t.paidBadge}
            </span>
          )}
        </div>

        {/* Quick Read Overlay Button on Hover */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openReader(book);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg shadow-md hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.readSample}</span>
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          {/* Category & Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {category}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t.pagesCount(book.pages)}</span>
            <span aria-hidden="true">·</span>
            <span>{book.format}</span>
          </div>

          {/* Book Title */}
          <h3
            onClick={() => openReader(book)}
            className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors leading-snug"
            title={title}
          >
            {title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {language === 'bn' ? 'লেখক:' : 'By'}{' '}
            <span className="font-medium text-slate-800 dark:text-slate-200">{author}</span>
          </p>

          {/* Short Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {shortDesc}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          
          {/* Price */}
          <div>
            {isFree ? (
              <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {t.freeBookLabel}
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                  {settings.currencySymbol} {book.price}
                </span>
                {book.originalPrice && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    {settings.currencySymbol} {book.originalPrice}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: Sample Reader & Primary Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openReader(book)}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
              title={t.readSample}
              aria-label={t.readSample}
            >
              <Eye className="w-4 h-4" />
            </button>

            {isFree ? (
              <button
                onClick={() => generateEbookDownload(book)}
                className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl transition-colors whitespace-nowrap shadow-xs active:scale-95"
                title={t.downloadBtn}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadBtn}</span>
              </button>
            ) : (
              <button
                onClick={() => openCheckout(book)}
                className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors whitespace-nowrap shadow-xs active:scale-95"
                title="Order via WhatsApp with bKash/Nagad"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>{t.buyWhatsAppBtn}</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </article>
  );
};
