import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HelpCircle, ChevronDown, MessageSquareText, ShieldCheck, Smartphone, Download, CreditCard, Tag } from 'lucide-react';

interface FAQItem {
  id: string;
  icon: React.ElementType;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    icon: CreditCard,
    question: 'How do I pay via bKash or Nagad?',
    questionBn: 'বিকাশ বা নগদের মাধ্যমে কীভাবে পেমেন্ট করব?',
    answer: 'Select any paid e-book and click "Buy via WhatsApp". In the modal, you will see our verified personal bKash (01712-455726) and Nagad (01700-968369) numbers. Send Money the exact amount from your bKash/Nagad app, copy the Transaction ID (TrxID), enter it into the form along with your name, and click "Send Order via WhatsApp".',
    answerBn: 'যে বইটি কিনতে চান তার "হোয়াটসঅ্যাপে কিনুন" বাটনে ক্লিক করুন। পপআপে আমাদের বিকাশ পার্সোনাল (০১৭১২-৪৫৫৭২৬) এবং নগদ পার্সোনাল (০১৭০০-৯৬৮৩৬৯) নম্বর পেয়ে যাবেন। আপনার বিকাশ বা নগদ অ্যাপ থেকে "Send Money" করে TrxID এবং আপনার নাম বক্সে বসিয়ে "হোয়াটসঅ্যাপে অর্ডার পাঠান" বাটনে ক্লিক করলেই আপনার হোয়াটসঅ্যাপ ওপেন হবে।'
  },
  {
    id: 'faq-2',
    icon: MessageSquareText,
    question: 'How quickly will I receive the e-book on WhatsApp?',
    questionBn: 'অর্ডার করার কতক্ষণ পর বইয়ের ডাউনলোড লিংক পাব?',
    answer: 'Our support team monitors WhatsApp 24/7. Once we verify your TrxID against the payment notification (typically within 2 to 10 minutes), we will immediately reply with your high-speed Google Drive / Direct PDF download link.',
    answerBn: 'আমাদের হোয়াটসঅ্যাপ টিম নিয়মিত পেমেন্ট যাচাই করে। আপনার TrxID কনফার্ম হওয়ার মাত্র ২ থেকে ১০ মিনিটের মধ্যে সরাসরি হোয়াটসঅ্যাপ চ্যাটে আপনার হাই-স্পিড গুগল ড্রাইভ বা ডিরেক্ট পিডিএফ ডাউনলোড লিংক পাঠিয়ে দেওয়া হবে।'
  },
  {
    id: 'faq-3',
    icon: Smartphone,
    question: 'Can I read these e-books on mobile, tablet, and PC without extra apps?',
    questionBn: 'বইগুলো কি মোবাইল ও ল্যাপটপে সহজে পড়া যাবে? কোনো বাড়তি অ্যাপ লাগবে কি?',
    answer: 'Yes! All e-books are delivered in standard, high-quality PDF and EPUB formats. You can read them directly on Android, iPhone/iPad, Windows, and Mac using any built-in PDF viewer or browser without requiring desktop mode.',
    answerBn: 'হ্যাঁ, অবশ্যই! প্রতিটি ই-বুক ক্রিস্টাল ক্লিয়ার পিডিএফ (PDF) ও ই-পাব (EPUB) ফরম্যাটে তৈরি। আপনি যেকোনো অ্যান্ড্রয়েড মোবাইল, আইফোন, ট্যাবলেট কিংবা ল্যাপটপে সাধারণ PDF ভিউয়ার বা ব্রাউজারে অনায়াসে পড়তে পারবেন।'
  },
  {
    id: 'faq-4',
    icon: Download,
    question: 'How do free e-books work? Are they completely free?',
    questionBn: 'ফ্রি ই-বুকগুলো কি সত্যিই সম্পূর্ণ বিনামূল্যে পাওয়া যাবে?',
    answer: 'Yes! All e-books marked with a green "Free" badge can be downloaded instantly with 1-click. No signup, registration, credit card, or payment is required. You can also preview sample chapters right on this website.',
    answerBn: 'হ্যাঁ, ১০০% ফ্রি! যেসব বইতে সবুজ "ফ্রি" ব্যাজ রয়েছে, সেগুলোতে "ফ্রি ডাউনলোড" বাটনে ক্লিক করা মাত্রই আপনার ডিভাইসে সরাসরি ফাইল ডাউনলোড শুরু হয়ে যাবে। কোনো একাউন্ট খোলা বা সাইন-আপ করতে হবে না।'
  },
  {
    id: 'faq-5',
    icon: Tag,
    question: 'How do discount coupons work?',
    questionBn: 'কুপন বা ডিসকাউন্ট কোড কীভাবে ব্যবহার করব?',
    answer: 'During checkout, enter promotional promo codes like "KITAB20" (for 20% off) or "TAHSIN50" (for ৳50 flat discount) into the coupon box and click "Apply". The discounted price will automatically be reflected in your total payable amount and formatted WhatsApp message.',
    answerBn: 'পেইড বইয়ের চেকআউট করার সময় কুপন বক্সে "KITAB20" (২০% ছাড়) বা "TAHSIN50" (৳৫০ ফ্ল্যাট ছাড়) লিখে "প্রয়োগ করুন" চাপলে সাথে সাথে মোট মূল্য কমে যাবে এবং হোয়াটসঅ্যাপ মেসেজেও ছাড় হিসাব হয়ে যাবে।'
  },
  {
    id: 'faq-6',
    icon: ShieldCheck,
    question: 'What if I encounter an issue with payment or download link?',
    questionBn: 'পেমেন্ট বা ডাউনলোড করতে কোনো সমস্যা হলে কী করব?',
    answer: 'KitabGhar offers 100% money-back guarantee. If you face any trouble downloading or opening the file, message us directly on WhatsApp (+880 1700-968369) with your screenshot, and we will resolve it immediately or replace the link.',
    answerBn: 'কিতাবঘরে পাঠকদের সন্তুষ্টি প্রথম অগ্রাধিকার। কোনো ফাইল ওপেন করতে বা লিংক পেতে সমস্যা হলে সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপ (+৮৮০ ১৭০০-৯৬৮৩৬৯) নম্বরে মেসেজ করুন, তাৎক্ষণিক সমাধান দেওয়া হবে।'
  }
];

export const FAQSection: React.FC = () => {
  const { language, settings } = useStore();
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFAQ = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const targetWhatsApp = settings.whatsappNumber.replace(/[^0-9]/g, '') || '8801700968369';

  return (
    <section id="faq" className="w-full bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {language === 'bn' ? 'আপনার মনে কি কোনো প্রশ্ন আছে?' : 'Have Questions? We Have Answers'}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            {language === 'bn'
              ? 'বিকাশ ও নগদ পেমেন্ট, ফ্রি ডাউনলোড এবং হোয়াটসঅ্যাপে বই পাওয়ার নিয়মাবলী সম্পর্কে জানুন।'
              : 'Learn how bKash/Nagad payments work, how fast you get your books, and how to read on any device.'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQS.map((item) => {
            const isOpen = openId === item.id;
            const Icon = item.icon;
            const q = language === 'bn' ? item.questionBn : item.question;
            const a = language === 'bn' ? item.answerBn : item.answer;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-5 sm:px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {q}
                    </span>
                  </div>

                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed sm:pl-11.5">
                      {a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Direct Help CTA Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-900/10">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold">
              {language === 'bn' ? 'আরও কোনো বিষয়ে জানতে চান?' : 'Still have more questions?'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              {language === 'bn'
                ? 'সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপ সাপোর্টে মেসেজ দিন, আমরা দ্রুত উত্তর দেব।'
                : 'Chat directly with our support team on WhatsApp for instant assistance.'}
            </p>
          </div>

          <a
            href={`https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(
              language === 'bn'
                ? 'আসসালামু আলাইকুম, কিতাবঘর ওয়েবসাইট থেকে যোগাযোগ করছি। আমার একটি বিষয় জানার ছিল।'
                : 'Hello KitabGhar, I have a question regarding your e-books.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-800 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all shrink-0"
          >
            <MessageSquareText className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে হেল্প নিন' : 'Chat on WhatsApp'}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
