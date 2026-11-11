import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Flame, Clock, Sparkles, ArrowRight, Tag, X } from 'lucide-react';

export const FlashSaleBanner: React.FC = () => {
  const { language, settings, openCheckout, ebooks } = useStore();
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('kitabghor_dismiss_flash_banner') === 'true';
    } catch {
      return false;
    }
  });

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
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / 1000 / 60);
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const flashConfig = settings.flashSale || {
    enabled: true,
    badgeBn: 'আজকের ফ্ল্যাশ সেল',
    badgeEn: 'Today Flash Deal',
    textBn: 'স্পেশাল কুপন কোড দিয়ে যেকোনো পেইড বইয়ে ২০% স্পেশাল ছাড়!',
    textEn: 'Use promo code for Flat 20% Instant Discount on any paid book!',
    promoCode: 'KITAB20'
  };

  if (isDismissed || flashConfig.enabled === false) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('kitabghor_dismiss_flash_banner', 'true');
    } catch {
      // fallback
    }
  };

  const format2Digits = (n: number) => n.toString().padStart(2, '0');

  // Find a popular paid book for quick order
  const featuredPaidBook = ebooks.find(b => b.type === 'paid') || ebooks[0];

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 text-white shadow-xs relative overflow-hidden text-xs">
      {/* Background flare */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 relative z-10">
        
        {/* Left Side: Deal Badge & Headline */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-200 border border-white/20 shadow-xs animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{language === 'bn' ? flashConfig.badgeBn : flashConfig.badgeEn}</span>
          </span>

          <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
            <span>{language === 'bn' ? flashConfig.textBn : flashConfig.textEn}</span>
            {flashConfig.promoCode && (
              <span className="underline decoration-amber-300 decoration-2 font-mono bg-black/25 px-2 py-0.5 rounded font-black text-amber-200">
                {flashConfig.promoCode}
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-rose-700 hover:bg-amber-50 font-black text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{language === 'bn' ? 'অর্ডার করুন' : 'Claim Offer'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-black/20 transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
