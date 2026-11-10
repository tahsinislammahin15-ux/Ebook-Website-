import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Check, Copy, MessageSquareText, ShieldCheck, ExternalLink } from 'lucide-react';

export const WhatsAppCheckoutModal: React.FC = () => {
  const { activeCheckoutBook, closeCheckout, settings, language, t } = useStore();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  if (!activeCheckoutBook) return null;

  const title = language === 'bn' && activeCheckoutBook.titleBn ? activeCheckoutBook.titleBn : activeCheckoutBook.title;
  const author = language === 'bn' && activeCheckoutBook.authorBn ? activeCheckoutBook.authorBn : activeCheckoutBook.author;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(type);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const getMethodNumber = () => {
    switch (paymentMethod) {
      case 'bKash': return { num: settings.bkashNumber, type: settings.bkashType, color: 'text-pink-600 bg-pink-50 border-pink-200' };
      case 'Nagad': return { num: settings.nagadNumber, type: settings.nagadType, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    }
  };

  // Generate WhatsApp formatted text in Bengali or English
  const generateWhatsAppMessage = () => {
    if (language === 'bn') {
      return `📚 *নতুন ই-বুক অর্ডার - ${settings.storeNameBn}*

*বইয়ের নাম:* ${title}
*মূল্য:* ${settings.currencySymbol} ${activeCheckoutBook.price} BDT
*ফরম্যাট:* ${activeCheckoutBook.format}

*গ্রাহকের তথ্য:*
• নাম: ${customerName.trim() || '[গ্রাহকের নাম]'}
• হোয়াটসঅ্যাপ নম্বর: ${customerPhone.trim() || '[ফোন নম্বর]'}

*পেমেন্ট ভেরিফিকেশন তথ্য:*
• মাধ্যম: ${paymentMethod} (${getMethodNumber().type})
• যে নম্বর থেকে পাঠিয়েছেন: ${senderNumber.trim() || '[প্রেরকের নম্বর]'}
• ট্রানজেকশন আইডি (TrxID): ${trxId.trim() || '[TrxID]'}

অনুগ্রহ করে আমার পেমেন্ট যাচাই করে ই-বুক ডাউনলোডের লিংক দিন। ধন্যবাদ!`;
    }

    return `📚 *New E-Book Order - ${settings.storeName}*

*Book Title:* ${title}
*Price:* ${settings.currencySymbol} ${activeCheckoutBook.price} BDT
*Format:* ${activeCheckoutBook.format}

*Customer Details:*
• Name: ${customerName.trim() || '[Customer Name]'}
• WhatsApp: ${customerPhone.trim() || '[WhatsApp Phone]'}

*Payment Verification:*
• Method: ${paymentMethod} (${getMethodNumber().type})
• Sender Number: ${senderNumber.trim() || '[Sender Number]'}
• Transaction ID (TrxID): ${trxId.trim() || '[TrxID]'}

Please verify my payment and send me the e-book download link. Thank you!`;
  };

  const fullMessage = generateWhatsAppMessage();
  const targetWhatsApp = settings.whatsappNumber.replace(/[^0-9]/g, '') || '8801700968369';
  const whatsappUrl = `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(fullMessage)}`;

  const isFormValid = customerName.trim().length > 1 && trxId.trim().length > 3;

  const handleSendWhatsApp = () => {
    if (!isFormValid) return;
    setOrderSent(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull/Drag Affordance Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquareText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t.checkoutTitle}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {t.checkoutSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckout}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Selected Book Summary Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="w-14 h-18 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 shadow-xs">
              {activeCheckoutBook.coverImage ? (
                <img
                  src={activeCheckoutBook.coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {language === 'bn' ? 'লেখক:' : 'By'} {author} · {activeCheckoutBook.format}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {settings.currencySymbol} {activeCheckoutBook.price} BDT
                </span>
                {activeCheckoutBook.originalPrice && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    {settings.currencySymbol} {activeCheckoutBook.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* STEP 1: Select Payment Method & View Number */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>{t.step1Title}</span>
              </label>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t.step1Exact(settings.currencySymbol, activeCheckoutBook.price)}
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('bKash')}
                className={`min-h-[46px] px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  paymentMethod === 'bKash'
                    ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>bKash (বিকাশ)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Nagad')}
                className={`min-h-[46px] px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  paymentMethod === 'Nagad'
                    ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Nagad (নগদ)</span>
              </button>
            </div>

            {/* Active Payment Number Box with 1-Click Copy */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 block mb-0.5 truncate">
                  {t.sendMoneyTo(paymentMethod, getMethodNumber().type)}
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                  {getMethodNumber().num}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getMethodNumber().num, paymentMethod)}
                className="min-h-[42px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shrink-0 active:scale-95"
              >
                {copiedNumber === paymentMethod ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyNumber}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STEP 2: Customer Details & Transaction ID */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>{t.step2Title}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  {t.yourFullName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.yourFullNamePlaceholder}
                  className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  {t.yourWhatsAppNumber}
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t.yourWhatsAppPlaceholder}
                  className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  {t.senderNumber}
                </label>
                <input
                  type="text"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder={t.senderNumberPlaceholder}
                  className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  {t.trxId} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder={t.trxIdPlaceholder}
                  className="w-full px-3.5 py-3 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[46px]"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Preview Formatted WhatsApp Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.previewMessageTitle}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fullMessage);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedText ? t.copiedText : t.copyText}
              </button>
            </div>
            
            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {fullMessage}
            </pre>
          </div>

          {/* Verification Note */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              {t.checkoutNote(language === 'bn' ? settings.storeNameBn : settings.storeName)}
            </p>
          </div>

          {orderSent && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
              {t.chatOpenedNotice(settings.whatsappDisplayNumber)}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {t.totalPayable} <strong className="text-slate-900 dark:text-white font-mono">{settings.currencySymbol} {activeCheckoutBook.price}</strong>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleSendWhatsApp}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-sm font-bold rounded-xl transition-all shadow-sm active:scale-98 order-1 sm:order-2 ${
                isFormValid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>{t.sendOrderBtn}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={closeCheckout}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors order-2 sm:order-1"
            >
              {t.cancel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
