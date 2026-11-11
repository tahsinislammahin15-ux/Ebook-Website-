import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Gift, Check, Copy, ArrowRight, X } from 'lucide-react';

export const DownloadGiftModal: React.FC = () => {
  const { downloadGiftModalBook, closeDownloadGiftModal, language, settings, openCheckout, ebooks } = useStore();
  const [copied, setCopied] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (downloadGiftModalBook) {
      // Generate 35 confetti particles
      const colors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];
      const pieces = Array.from({ length: 35 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setConfettiPieces(pieces);
    }
  }, [downloadGiftModalBook]);

  if (!downloadGiftModalBook) return null;

  const promoCode = settings.downloadGiftCouponCode || 'FIRST20';
  const title = language === 'bn' && downloadGiftModalBook.titleBn ? downloadGiftModalBook.titleBn : downloadGiftModalBook.title;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const featuredPaidBook = ebooks.find(b => b.type === 'paid');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      {/* Floating Confetti Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-60">
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              backgroundColor: p.color
            }}
            className="absolute top-0 w-2.5 h-2.5 rounded-full animate-bounce duration-1000"
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5 z-70"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeDownloadGiftModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gift Icon Header */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <Gift className="w-8 h-8" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block">
            {language === 'bn' ? '🎉 ডাউনলোড সফল হয়েছে!' : '🎉 Download Complete!'}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {language === 'bn' ? 'আপনার জন্য একটি বিশেষ উপহার!' : 'Here is a Thank-You Gift!'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {language === 'bn' ? (
              <>
                <strong>&quot;{title}&quot;</strong> বইটি আপনার ডিভাইসে সেভ হয়েছে। প্রথম পেইড বই অর্ডারে <strong>২০% স্পেশাল ছাড়ের</strong> জন্য আপনার উপহার কোড:
              </>
            ) : (
              <>
                <strong>&quot;{title}&quot;</strong> is downloaded. Use this secret code for an <strong>instant 20% discount</strong> on your first paid order:
              </>
            )}
          </p>
        </div>

        {/* Promo Code Box with 1-Click Copy */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-dashed border-amber-400 dark:border-amber-600 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
              {language === 'bn' ? 'কুপন কোড' : 'PROMO CODE'}
            </span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white tracking-wider">
              {promoCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>{language === 'bn' ? 'কোড কপি' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          {featuredPaidBook && (
            <button
              onClick={() => {
                closeDownloadGiftModal();
                openCheckout(featuredPaidBook);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? 'পেইড বইগুলোতে ছাড় নিন' : 'Explore Paid E-Books'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={closeDownloadGiftModal}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {language === 'bn' ? 'পরে দেখব' : 'Later'}
          </button>
        </div>

      </div>
    </div>
  );
};
