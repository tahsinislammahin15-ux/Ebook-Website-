import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Flame, Clock, Sparkles, ArrowRight, Tag } from 'lucide-react';

export const FlashSaleBanner: React.FC = () => {
  const { language, settings, openCheckout, ebooks } = useStore();

  // 12-hour cyclical countdown for real urgency
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 5,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    // Generate predictable countdown target based on day
    const calculateTimeRemaining = () => {
      const now = new Date();
      // Ends at midnight or noon
      const target = new Date(now);
      if (now.getHours() < 12) {
        target.setHours(12, 0, 0, 0);
      } else {
        target.setHours(24, 0, 0, 0);
      }
      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const format2Digits = (n: number) => n.toString().padStart(2, '0');

  // Find a popular paid book for quick order
  const featuredPaidBook = ebooks.find(b => b.type === 'paid') || ebooks[0];

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 text-white shadow-md relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 relative z-10 text-center md:text-left">
        
        {/* Left Side: Deal Badge & Headline */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-200 border border-white/20 shadow-xs animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{language === 'bn' ? 'আজকের ফ্ল্যাশ সেল' : 'Today Flash Deal'}</span>
          </span>

          <p className="text-xs sm:text-sm font-bold text-white">
            {language === 'bn' ? (
              <span>
                স্পেশাল কুপন কোড <span className="underline decoration-amber-300 decoration-2 font-mono bg-black/20 px-1.5 py-0.5 rounded">KITAB20</span> দিয়ে যেকোনো পেইড বইয়ে <strong>২০% স্পেশাল ছাড়!</strong>
              </span>
            ) : (
              <span>
                Use coupon <span className="underline decoration-amber-300 decoration-2 font-mono bg-black/20 px-1.5 py-0.5 rounded">KITAB20</span> for <strong>Flat 20% Instant Discount!</strong>
              </span>
            )}
          </p>
        </div>

        {/* Right Side: Live Countdown Timer & CTA */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0">
          
          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-[11px] text-amber-100 hidden sm:inline">
              {language === 'bn' ? 'অফার শেষ হতে বাকি:' : 'Ends in:'}
            </span>
            <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-sm">
              <span className="px-1.5 py-0.5 bg-black/35 rounded-md border border-white/10">
                {format2Digits(timeLeft.hours)}
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 bg-black/35 rounded-md border border-white/10">
                {format2Digits(timeLeft.minutes)}
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 bg-black/35 rounded-md border border-white/10 text-amber-300">
                {format2Digits(timeLeft.seconds)}
              </span>
            </div>
          </div>

          {/* Quick Apply Button */}
          {featuredPaidBook && (
            <button
              onClick={() => openCheckout(featuredPaidBook)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-rose-700 hover:bg-amber-50 font-extrabold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'bn' ? 'অর্ডার করুন' : 'Claim Offer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
