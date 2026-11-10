import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';

interface PurchaseEvent {
  id: string;
  buyerName: string;
  buyerNameBn: string;
  district: string;
  districtBn: string;
  bookTitle: string;
  bookTitleBn: string;
  timeAgo: string;
  timeAgoBn: string;
  bookId?: string;
}

const RECENT_SALES: PurchaseEvent[] = [
  {
    id: 's1',
    buyerName: 'Hasib Rahman',
    buyerNameBn: 'হাসিব রহমান',
    district: 'Mirpur, Dhaka',
    districtBn: 'মিরপুর, ঢাকা',
    bookTitle: 'Python & AI Mastery',
    bookTitleBn: 'পাইথন ও এআই মাস্টারি',
    timeAgo: '3 minutes ago',
    timeAgoBn: '৩ মিনিট আগে',
    bookId: 'python-ai-mastery'
  },
  {
    id: 's2',
    buyerName: 'Tanveer Ahmed',
    buyerNameBn: 'তানভীর আহমেদ',
    district: 'Agrabad, Chittagong',
    districtBn: 'আগ্রাবাদ, চট্টগ্রাম',
    bookTitle: 'Bangla Freelancing Playbook',
    bookTitleBn: 'বাংলা ফ্রিল্যান্সিং প্লেবুক',
    timeAgo: '7 minutes ago',
    timeAgoBn: '৭ মিনিট আগে',
    bookId: 'bangla-freelancing-playbook'
  },
  {
    id: 's3',
    buyerName: 'Nusrat Jahan',
    buyerNameBn: 'নুসরাত জাহান',
    district: 'Uttara, Dhaka',
    districtBn: 'উত্তরা, ঢাকা',
    bookTitle: 'Modern Web Architecture',
    bookTitleBn: 'মডার্ন ওয়েব আর্কিটেকচার',
    timeAgo: '12 minutes ago',
    timeAgoBn: '১২ মিনিট আগে',
    bookId: 'modern-web-architecture'
  },
  {
    id: 's4',
    buyerName: 'Mahmudul Hasan',
    buyerNameBn: 'মাহমুদুল হাসান',
    district: 'Zindabazar, Sylhet',
    districtBn: 'জিন্দাবাজার, সিলেট',
    bookTitle: 'Micro-SaaS & Indie Hacker',
    bookTitleBn: 'মাইক্রো-স্যাস ও ইন্ডি হ্যাকার গাইড',
    timeAgo: '18 minutes ago',
    timeAgoBn: '১৮ মিনিট আগে',
    bookId: 'micro-saas-guide'
  },
  {
    id: 's5',
    buyerName: 'Shakil Hossain',
    buyerNameBn: 'শাকিল হোসেন',
    district: 'Rajshahi Sadar',
    districtBn: 'রাজশাহী সদর',
    bookTitle: 'Python & AI Mastery',
    bookTitleBn: 'পাইথন ও এআই মাস্টারি',
    timeAgo: '25 minutes ago',
    timeAgoBn: '২৫ মিনিট আগে',
    bookId: 'python-ai-mastery'
  },
  {
    id: 's6',
    buyerName: 'Farhana Yeasmin',
    buyerNameBn: 'ফারহানা ইয়াসমিন',
    district: 'Khulna City',
    districtBn: 'খুলনা শহর',
    bookTitle: 'Bangla Freelancing Playbook',
    bookTitleBn: 'বাংলা ফ্রিল্যান্সিং প্লেবুক',
    timeAgo: '32 minutes ago',
    timeAgoBn: '৩২ মিনিট আগে',
    bookId: 'bangla-freelancing-playbook'
  }
];

export const LiveSalesNotification: React.FC = () => {
  const { language, ebooks, openCheckout } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial popup display after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Auto-cycling interval: show for 6 seconds, hide for 14 seconds
    const cycleInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (!isDismissed) {
          setCurrentIndex(prev => (prev + 1) % RECENT_SALES.length);
          setIsVisible(true);
        }
      }, 1000);
    }, 20000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, [isDismissed]);

  // Auto-hide each single toast after 6.5s
  useEffect(() => {
    if (!isVisible) return;
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6500);
    return () => clearTimeout(hideTimer);
  }, [isVisible]);

  if (isDismissed) return null;

  const current = RECENT_SALES[currentIndex];
  const buyerName = language === 'bn' ? current.buyerNameBn : current.buyerName;
  const district = language === 'bn' ? current.districtBn : current.district;
  const bookTitle = language === 'bn' ? current.bookTitleBn : current.bookTitle;
  const timeAgo = language === 'bn' ? current.timeAgoBn : current.timeAgo;

  const handleClickBook = () => {
    if (current.bookId) {
      const targetBook = ebooks.find(b => b.id === current.bookId);
      if (targetBook) {
        openCheckout(targetBook);
      }
    }
  };

  return (
    <div
      aria-live="polite"
      className={`fixed z-40 transition-all duration-500 ease-out 
        bottom-20 sm:bottom-6 left-3 sm:left-6 max-w-sm sm:max-w-md w-[calc(100%-1.5rem)] sm:w-auto
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 pointer-events-none scale-95'}`}
    >
      <div 
        onClick={handleClickBook}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-start gap-3 cursor-pointer hover:shadow-2xl hover:border-emerald-500/40 transition-all group"
      >
        {/* Animated Badge Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <ShoppingBag className="w-5 h-5" />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {buyerName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              ({district})
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
            {language === 'bn' ? 'এইমাত্র কিনলেন' : 'just bought'}{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 group-hover:underline">
              &quot;{bookTitle}&quot;
            </strong>
          </p>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{language === 'bn' ? 'যাচাইকৃত ক্রেতা' : 'Verified Purchase'}</span>
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setIsDismissed(true);
          }}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
