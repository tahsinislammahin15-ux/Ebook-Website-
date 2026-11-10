import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerReview } from '../types/ebook';
import { Star, MessageSquareQuote, CheckCircle, Plus, Send } from 'lucide-react';

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Hasibul Islam',
    nameBn: 'হাসিবুল ইসলাম',
    role: 'Junior Software Engineer',
    roleBn: 'জুনিয়র সফটওয়্যার ইঞ্জিনিয়ার',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Python & AI Mastery e-book helped me land my first tech internship. The Bengali explanations of complex concepts were exceptionally clear!',
    commentBn: 'পাইথন ও এআই বইটি পড়ে আমি অনেক কিছু সহজভাবে শিখতে পেরেছি। বাংলা ভাষায় এত সুন্দর ও আধুনিক হ্যান্ডস-অন গাইড আসলেই বিরল!',
    bookTitle: 'Python & AI Mastery',
    bookTitleBn: 'পাইথন ও এআই মাস্টারি',
    verified: true,
    date: '3 days ago'
  },
  {
    id: 'rev-2',
    name: 'Tania Akter',
    nameBn: 'তানিয়া আক্তার',
    role: 'Fiverr & Upwork Top Freelancer',
    roleBn: 'আপওয়ার্ক ও ফাইভার ফ্রিল্যান্সার',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Purchased Bangla Freelancing Playbook via bKash. Got the Google Drive link on WhatsApp within 4 minutes! Outstanding service.',
    commentBn: 'বিকাশ দিয়ে অর্ডার করার মাত্র ৪ মিনিটের মধ্যেই হোয়াটসঅ্যাপে গুগল ড্রাইভের ফুল ডাউনলোড লিংক পেয়েছি। সার্ভিস অসাধারণ!',
    bookTitle: 'Bangla Freelancing Playbook',
    bookTitleBn: 'বাংলা ফ্রিল্যান্সিং প্লেবুক',
    verified: true,
    date: '1 week ago'
  },
  {
    id: 'rev-3',
    name: 'Mehedi Hasan Rifat',
    nameBn: 'মেহেদী হাসান রিফাত',
    role: 'Computer Science Student, RUET',
    roleBn: 'সিএসই শিক্ষার্থী, রুয়েট',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Downloaded the free Modern Web Architecture sample excerpt first. Loved the quality and immediately bought the complete version!',
    commentBn: 'প্রথমে ওয়েবসাইটের রিডার দিয়ে ফ্রিতে নমুনা অংশ পড়েছিলাম। কোয়ালিটি দেখে মুগ্ধ হয়ে সাথে সাথেই পুরো বইটি অর্ডার করেছি।',
    bookTitle: 'Modern Web Architecture',
    bookTitleBn: 'মডার্ন ওয়েব আর্কিটেকচার',
    verified: true,
    date: '2 weeks ago'
  }
];

export const ReviewsSection: React.FC = () => {
  const { language } = useStore();
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('kitabghor_customer_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  const [showAddReview, setShowAddReview] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bookTitle, setBookTitle] = useState('Python & AI Mastery');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      nameBn: name.trim(),
      role: role.trim() || 'Verified Reader',
      roleBn: role.trim() || 'যাচাইকৃত পাঠক',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      rating,
      comment: comment.trim(),
      commentBn: comment.trim(),
      bookTitle,
      bookTitleBn: bookTitle,
      verified: true,
      date: language === 'bn' ? 'এইমাত্র' : 'Just now'
    };

    const next = [newRev, ...reviews];
    setReviews(next);
    localStorage.setItem('kitabghor_customer_reviews', JSON.stringify(next));

    setName('');
    setRole('');
    setComment('');
    setShowAddReview(false);
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3500);
  };

  return (
    <section id="reviews" className="w-full py-16 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{language === 'bn' ? 'পাঠকদের আসল রিভিউ ও রেটিং' : 'Reader Reviews & Ratings'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {language === 'bn' ? 'পাঠকরা কী বলছেন আমাদের সম্পর্কে?' : 'What Our Readers Are Saying'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAddReview(prev => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'আপনার রিভিউ দিন' : 'Write a Review'}</span>
          </button>
        </div>

        {submittedNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 text-center font-bold">
            {language === 'bn' ? 'ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে যুক্ত হয়েছে।' : 'Thank you! Your verified review has been published.'}
          </div>
        )}

        {/* Add Review Form Modal / Drawer */}
        {showAddReview && (
          <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 max-w-xl mx-auto shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share Your Reading Experience'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'পেশা / পরিচয়' : 'Role / Profession'}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Freelancer / Student"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'রেটিং' : 'Rating'}
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                {language === 'bn' ? 'আপনার রিভিউ মন্তব্য' : 'Your Review'} *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={language === 'bn' ? 'বইটি আপনার কেমন লেগেছে?...' : 'Write your honest feedback...'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রিভিউ সাবমিট করুন' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => {
            const nameStr = language === 'bn' ? rev.nameBn : rev.name;
            const roleStr = language === 'bn' ? rev.roleBn : rev.role;
            const commentStr = language === 'bn' ? rev.commentBn : rev.comment;
            const bookStr = language === 'bn' ? rev.bookTitleBn : rev.bookTitle;

            return (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-5 hover:shadow-md transition-shadow relative"
              >
                <div className="space-y-3">
                  {/* Stars & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ভেরিফাইড পাঠক' : 'Verified'}</span>
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    &quot;{commentStr}&quot;
                  </p>
                </div>

                {/* Footer User Info */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={nameStr}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {nameStr}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {roleStr}
                    </p>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block truncate">
                      {language === 'bn' ? 'বই:' : 'For:'} {bookStr}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
