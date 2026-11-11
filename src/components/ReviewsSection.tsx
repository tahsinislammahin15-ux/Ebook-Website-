import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerReview } from '../types/ebook';
import { Star, CheckCircle, Plus, Send } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { language, settings, reviews, addReview } = useStore();

  const [showAddReview, setShowAddReview] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bookTitle, setBookTitle] = useState('Python & AI Mastery');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  if (settings.showReviewsSection === false) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.replace(/<\s*\/?\s*script[^>]*>/gi, '').trim().slice(0, 60);
    const cleanRole = role.replace(/<\s*\/?\s*script[^>]*>/gi, '').trim().slice(0, 60);
    const cleanComment = comment.replace(/<\s*\/?\s*script[^>]*>/gi, '').trim().slice(0, 500);
    if (!cleanName || !cleanComment) return;

    // Rate-limit public review submissions (max 1 review per 60 seconds)
    try {
      const lastSub = sessionStorage.getItem('kitabghor_last_review_ts');
      if (lastSub && Date.now() - parseInt(lastSub, 10) < 60000) {
        setShowAddReview(false);
        return;
      }
      sessionStorage.setItem('kitabghor_last_review_ts', Date.now().toString());
    } catch {
      // ignore
    }

    const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: cleanName,
      nameBn: cleanName,
      role: cleanRole || 'Verified Reader',
      roleBn: cleanRole || 'যাচাইকৃত পাঠক',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      rating: safeRating,
      comment: cleanComment,
      commentBn: cleanComment,
      bookTitle: bookTitle.slice(0, 120),
      bookTitleBn: bookTitle.slice(0, 120),
      verified: true,
      date: language === 'bn' ? 'এইমাত্র' : 'Just now'
    };

    addReview(newRev);

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
