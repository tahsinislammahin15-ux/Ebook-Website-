import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookOpen, Shield, MessageSquareText } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, openAdmin, language, t } = useStore();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-xs border border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-center p-0.5">
                <img
                  src={settings.logoUrl || "/assets/aistudio/1794301559714_e54adc4f.jpg"}
                  alt="KitabGhar Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                {language === 'bn' ? settings.storeNameBn : settings.storeName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? settings.storeTaglineBn : settings.storeTagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <a
              href="#how-it-works"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {language === 'bn' ? 'কীভাবে কিনবেন' : 'How It Works'}
            </a>
            <a
              href="#faq"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {language === 'bn' ? 'সাধারণ প্রশ্ন ও উত্তর (FAQ)' : 'FAQ'}
            </a>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                language === 'bn' ? 'হ্যালো, বই অর্ডার বিষয়ে কথা বলতে চাই।' : 'Hello, I have an inquiry about an e-book order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp: {settings.whatsappDisplayNumber}</span>
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <p>© {new Date().getFullYear()} {language === 'bn' ? settings.storeNameBn : settings.storeName}. All rights reserved.</p>
            {/* Subtle owner access portal */}
            <button
              onClick={openAdmin}
              className="opacity-20 hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Secure Owner Portal (Ctrl+Shift+A)"
              aria-label="Owner Access"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>{t.compatibleWithCpanel}</span>
            <span aria-hidden="true">·</span>
            <span>{t.staticCatalog}</span>
            <span aria-hidden="true">·</span>
            <span>{t.bdReady}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
