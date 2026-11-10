import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookOpen, ArrowRight, X } from 'lucide-react';

export const ReadingResumeBanner: React.FC = () => {
  const { lastReadBook, language, ebooks, openReader } = useStore();

  if (!lastReadBook) return null;

  const targetBook = ebooks.find(b => b.id === lastReadBook.bookId);
  if (!targetBook) return null;

  const title = language === 'bn' && targetBook.titleBn ? targetBook.titleBn : targetBook.title;

  return (
    <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs">
        
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          
          <div className="min-w-0 flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {language === 'bn' ? 'আপনার শেষ পঠন:' : 'Continue reading:'}
            </span>
            <strong className="font-bold text-slate-900 dark:text-white truncate">
              &quot;{title}&quot;
            </strong>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              {language === 'bn' ? `পৃষ্ঠা ${lastReadBook.currentPage} (${lastReadBook.percent}%)` : `Page ${lastReadBook.currentPage} (${lastReadBook.percent}%)`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openReader(targetBook)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <span>{language === 'bn' ? 'পড়া শুরু করুন' : 'Resume'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
