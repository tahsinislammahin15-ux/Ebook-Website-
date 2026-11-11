import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Heart, Award, Sparkles, BookOpen, MessageSquareText } from 'lucide-react';

export const AuthorStorySection: React.FC = () => {
  const { language, settings } = useStore();

  const story = settings.authorStory || {
    enabled: true,
    founderName: 'Tahsin Islam',
    founderNameBn: 'তাহসিন ইসলাম (Tahsin Islam)',
    founderRole: 'Founder & Curator, KitabGhar',
    founderRoleBn: 'প্রতিষ্ঠাতা ও প্রধান কিউরেটর, কিতাবঘর',
    headline: 'Empowering Curious Minds Across Bangladesh',
    headlineBn: 'জ্ঞানের আলো ছড়িয়ে দিতেই কিতাবঘরের সৃষ্টি',
    bio: 'KitabGhar was founded with a singular mission: to make premium programming, freelancing, and self-growth knowledge accessible to every Bangladeshi reader without needing international credit cards. With seamless bKash/Nagad verification and 1-click downloads, your reading journey starts here.',
    bioBn: 'বাংলাদেশে আন্তর্জাতিক মানের প্রযুক্তি, প্রোগ্রামিং, ফ্রিল্যান্সিং ও ক্যারিয়ার বিষয়ক ই-বুক সংগ্রহ করা অনেক সময় সাধারণ পাঠকদের জন্য বেশ কঠিন হয়ে দাঁড়ায়। কিতাবঘর তৈরি করা হয়েছে যাতে কোনো ক্রেডিট কার্ড বা ঝামেলা ছাড়াই প্রতিটি শিক্ষার্থী ও পাঠক সহজে বিকাশ ও নগদের মাধ্যমে নির্বাচিত বাংলা ও ইংরেজি ই-বুক সংগ্রহ করতে পারেন এবং সরাসরি ফ্রিতেও সেরা বইগুলো পড়তে পারেন।'
  };

  if (story.enabled === false) return null;

  const targetWhatsApp = settings.whatsappNumber.replace(/[^0-9]/g, '') || '8801700968369';

  return (
    <section id="about" className="w-full py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative overflow-hidden">
          
          {/* Subtle Ambient Background Highlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Side: Founder / Brand Avatar */}
          <div className="flex flex-col items-center text-center shrink-0 space-y-3 z-10">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden p-1.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 shadow-lg">
              <img
                src={settings.logoUrl || '/assets/aistudio/1794301559714_e54adc4f.jpg'}
                alt="KitabGhar Logo & Story"
                className="w-full h-full object-contain rounded-2xl bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {language === 'bn' ? story.founderNameBn : story.founderName}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {language === 'bn' ? story.founderRoleBn : story.founderRole}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '১০০% বিশ্বস্ত ও ভেরিফাইড' : '100% Verified Platform'}</span>
            </div>
          </div>

          {/* Right Side: Trust Manifesto & Mission */}
          <div className="flex-1 space-y-4 text-center md:text-left z-10">
            
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Heart className="w-3.5 h-3.5 fill-emerald-600" />
              <span>{language === 'bn' ? 'আমাদের গল্প ও অঙ্গীকার' : 'Our Story & Commitment'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {language === 'bn' ? story.headlineBn : story.headline}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {language === 'bn' ? story.bioBn : story.bio}
            </p>

            {/* 3 Pillars of Trust */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'হাতে নির্বাচিত বই' : 'Curated Quality'}</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'প্রতিটি বই বাস্তব উপযোগী ও প্র্যাক্টিক্যাল।' : 'Only high-impact practical publications.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'মানিব্যাক গ্যারান্টি' : 'Money-Back Safe'}</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'ফাইল বা লিংকে সমস্যা হলে ১০০% রিফান্ড।' : 'Instant replacement or full refund.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ হেল্পলাইন' : 'Live WhatsApp'}</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'সরাসরি প্রতিষ্ঠাতা ও টিমের সাথে চ্যাট।' : 'Direct assistance within minutes.'}
                </p>
              </div>
            </div>

            {/* Direct WhatsApp chat action */}
            <div className="pt-2 flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <a
                href={`https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(
                  language === 'bn' 
                    ? 'আসসালামু আলাইকুম তাহসিন ভাই, কিতাবঘর ওয়েবসাইট দেখে আপনার সাথে যোগাযোগ করছি।' 
                    : 'Hello Tahsin, I reached out via KitabGhar story section.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-white active:scale-95 transition-all"
              >
                <MessageSquareText className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>{language === 'bn' ? 'প্রতিষ্ঠাতার সাথে সরাসরি কথা বলুন' : 'Message Founder on WhatsApp'}</span>
              </a>

              <span className="text-xs text-slate-500">
                {language === 'bn' ? 'অফিশিয়াল সাপোর্ট নম্বর:' : 'Support Number:'} <strong className="font-mono text-slate-800 dark:text-slate-200">{settings.whatsappDisplayNumber}</strong>
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
