import React from 'react';
import { useStore } from '../context/StoreContext';
import { ComboBundle } from '../types/ebook';
import { Package, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const COMBO_BUNDLES: ComboBundle[] = [
  {
    id: 'bundle-dev',
    name: 'Developer & AI Super Combo',
    nameBn: 'প্রোগ্রামার ও এআই সুপার কম্বো প্যাক',
    tagline: 'Python, Modern Web & Next-Gen AI Mastery in 2 Complete E-Books',
    taglineBn: 'পাইথন, আধুনিক ওয়েব আর্কিটেকচার এবং এআই মাস্টারি একসাথে',
    bookIds: ['python-ai-mastery', 'modern-web-architecture'],
    originalPrice: 750,
    bundlePrice: 520,
    savings: 230,
    badge: 'Save 30%',
    badgeBn: '৩০% সাশ্রয়ী'
  },
  {
    id: 'bundle-career',
    name: 'Freelancing & Business Master Bundle',
    nameBn: 'ফ্রিল্যান্সার ও অনলাইন উদ্যোক্তা কম্বো বান্ডেল',
    tagline: 'Step-by-step freelancing dollar income guide + Startup playbook',
    taglineBn: 'আন্তর্জাতিক মার্কেটপ্লেসে ডলার ইনকাম ও স্টার্টআপ তৈরির কৌশল',
    bookIds: ['bangla-freelancing-playbook', 'micro-saas-guide'],
    originalPrice: 650,
    bundlePrice: 450,
    savings: 200,
    badge: 'Popular Combo',
    badgeBn: 'জনপ্রিয় কম্বো'
  }
];

export const ComboDealsSection: React.FC = () => {
  const { language, settings, ebooks, openCheckout } = useStore();

  if (settings.showBundlesSection === false) return null;

  const activeBundles = settings.bundles && settings.bundles.length > 0 ? settings.bundles : COMBO_BUNDLES;
  if (activeBundles.length === 0) return null;

  const handleOrderBundle = (bundle: ComboBundle) => {
    // Construct a synthetic bundle book item for checkout
    const bundleBook = {
      id: `bundle-${bundle.id}`,
      title: bundle.name,
      titleBn: bundle.nameBn,
      author: 'KitabGhar Curated Bundle',
      authorBn: 'কিতাবঘর স্পেশাল কম্বো',
      category: 'Combo Pack',
      categoryBn: 'কম্বো প্যাক',
      type: 'paid' as const,
      price: bundle.bundlePrice,
      originalPrice: bundle.originalPrice,
      currency: 'BDT',
      pages: 450,
      language: 'English + বাংলা',
      format: 'PDF + EPUB (All Included)',
      coverImage: '/assets/aistudio/1794301559714_e54adc4f.jpg',
      shortDescription: bundle.tagline,
      shortDescriptionBn: bundle.taglineBn,
      description: `${bundle.name}: Includes full access to multiple complete e-books with personal bKash/Nagad verification and instant WhatsApp delivery.`,
      descriptionBn: `${bundle.nameBn}: একসাথে সম্পূর্ণ বইগুলোর ফুল এক্সেস এবং বিকাশ/নগদে সহজ পেমেন্ট করে হোয়াটসঅ্যাপে তাৎক্ষণিক ডাউনলোড লিংক।`,
      previewExcerpt: 'Exclusive Curated Bundle from KitabGhar.',
      previewExcerptBn: 'কিতাবঘরের বিশেষ কম্বো প্যাক।',
      tableOfContents: ['Complete E-Book 1', 'Complete E-Book 2', 'Bonus Resources & Cheat-Sheets'],
      tableOfContentsBn: ['১ম পূর্ণাঙ্গ ই-বুক', '২য় পূর্ণাঙ্গ ই-বুক', 'বোনাস রিসোর্স ও চিটশিট'],
      fileSize: '24 MB Bundle',
      rating: 5.0,
      featured: true
    };

    openCheckout(bundleBook);
  };

  return (
    <section id="bundles" className="w-full py-14 sm:py-16 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Package className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কম্বো বান্ডেল অফার (Bundle & Save)' : 'Bundle & Save Deals'}</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {language === 'bn' ? 'একসাথে কিনুন, বিশাল ছাড় উপভোগ করুন' : 'Buy Together, Save More'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'একাধিক প্রিমিয়াম বই একসাথে নিয়ে আপনার ক্যারিয়ারের গতি বাড়িয়ে তুলুন সেরা ছাড়ে।'
              : 'Supercharge your skills with our curated packs at massive discounted prices.'}
          </p>
        </div>

        {/* Bundle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeBundles.map((bundle) => {
            const name = language === 'bn' ? bundle.nameBn : bundle.name;
            const tagline = language === 'bn' ? bundle.taglineBn : bundle.tagline;
            const badge = language === 'bn' ? bundle.badgeBn : bundle.badge;

            // Find associated books
            const matchedBooks = ebooks.filter(b => bundle.bookIds.includes(b.id));

            return (
              <div
                key={bundle.id}
                className="relative rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 p-6 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between gap-6 overflow-hidden group"
              >
                {/* Corner Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-sm">
                  {badge}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1 pr-24">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {tagline}
                    </p>
                  </div>

                  {/* Included Books Preview */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {language === 'bn' ? 'এই বান্ডেলে যা যা পাচ্ছেন:' : 'What is included:'}
                    </span>
                    <div className="space-y-1.5">
                      {matchedBooks.map(b => (
                        <div key={b.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold">{language === 'bn' && b.titleBn ? b.titleBn : b.title}</span>
                          <span className="text-slate-400">({settings.currencySymbol} {b.price})</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>{language === 'bn' ? 'লাইফটাইম আপডেট ও রিডিং সাপোর্ট' : 'Lifetime updates & WhatsApp support'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Order Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {settings.currencySymbol} {bundle.bundlePrice}
                      </span>
                      <span className="text-sm text-slate-400 line-through font-mono">
                        {settings.currencySymbol} {bundle.originalPrice}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      {language === 'bn' ? `আপনি বাঁচাচ্ছেন ৳${bundle.savings}` : `You save ৳${bundle.savings}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrderBundle(bundle)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'কম্বো কিনুন' : 'Get Bundle'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
