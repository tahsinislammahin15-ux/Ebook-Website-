import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

/**
 * DynamicSEO component that manages head title, meta description,
 * OpenGraph, Twitter cards, canonical tags, and Schema.org JSON-LD structured data.
 */
export const DynamicSEO: React.FC = () => {
  const { settings, language, ebooks } = useStore();
  const seo = settings.seo;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Determine active titles and descriptions by language
    const isBn = language === 'bn';
    const activeTitle = (isBn ? (seo?.metaTitleBn || seo?.metaTitle) : seo?.metaTitle) 
      || (isBn ? `${settings.storeNameBn} - ই-বুক স্টোর` : `${settings.storeName} - Digital E-Book Store`);
    
    const activeDesc = (isBn ? (seo?.metaDescriptionBn || seo?.metaDescription) : seo?.metaDescription)
      || (isBn 
          ? `ফ্রি ও পেইড বাংলা-ইংরেজি ই-বুক ডাউনলোড করুন। বিকাশ ও নগদ পেমেন্ট ভেরিফিকেশন সহ হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন।` 
          : `Download free curated e-books or buy premium tech, freelancing, and business guides with instant WhatsApp ordering and bKash/Nagad verification.`);

    const ogTitle = (isBn ? (seo?.ogTitleBn || seo?.ogTitle) : seo?.ogTitle) || activeTitle;
    const ogDesc = (isBn ? (seo?.ogDescriptionBn || seo?.ogDescription) : seo?.ogDescription) || activeDesc;
    
    // Resolve Absolute Image URL
    const rawImage = seo?.ogImage || settings.logoUrl || '/assets/aistudio/1794301559714_e54adc4f.jpg';
    const ogImage = rawImage.startsWith('http') 
      ? rawImage 
      : `${window.location.origin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

    // Resolve Canonical URL
    const canonical = seo?.canonicalUrl?.trim() || `${window.location.origin}${window.location.pathname}`;

    // 2. Update Page Title
    document.title = activeTitle;

    // Helper to safely set or create a <meta> tag
    const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create a <link> tag
    const setLinkTag = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 3. Set Standard Search Meta Tags
    setMetaTag('name', 'description', activeDesc);
    if (seo?.keywords) {
      setMetaTag('name', 'keywords', seo.keywords);
    }
    if (seo?.author) {
      setMetaTag('name', 'author', seo.author);
    }

    // 4. Set OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Discord)
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:title', ogTitle);
    setMetaTag('property', 'og:description', ogDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:site_name', seo?.siteName || settings.storeName);
    setMetaTag('property', 'og:locale', isBn ? 'bn_BD' : 'en_US');

    // 5. Set Twitter / X Social Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', ogTitle);
    setMetaTag('name', 'twitter:description', ogDesc);
    setMetaTag('name', 'twitter:image', ogImage);
    if (seo?.twitterHandle) {
      setMetaTag('name', 'twitter:site', seo.twitterHandle);
      setMetaTag('name', 'twitter:creator', seo.twitterHandle);
    }

    // 6. Set Canonical Link
    setLinkTag('canonical', canonical);

    // 7. Inject Schema.org JSON-LD Structured Data
    const schemaScriptId = 'kitabghar-schema-jsonld';
    let scriptTag = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaScriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BookStore',
          '@id': `${canonical}#bookstore`,
          'name': isBn ? settings.storeNameBn : settings.storeName,
          'alternateName': settings.storeName,
          'description': activeDesc,
          'url': canonical,
          'image': ogImage,
          'currenciesAccepted': 'BDT',
          'paymentAccepted': 'bKash, Nagad',
          'priceRange': '৳0 - ৳1500',
          'telephone': settings.whatsappDisplayNumber,
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': settings.whatsappDisplayNumber,
            'contactType': 'customer service',
            'availableLanguage': ['Bangla', 'Bengali', 'English']
          }
        },
        {
          '@type': 'WebApplication',
          '@id': `${canonical}#webapp`,
          'name': isBn ? settings.storeNameBn : settings.storeName,
          'url': canonical,
          'applicationCategory': 'ShoppingApplication',
          'operatingSystem': 'All',
          'description': activeDesc,
          'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'BDT',
            'offerCount': ebooks.length.toString(),
            'lowPrice': '0',
            'highPrice': Math.max(...ebooks.map(b => b.price), 500).toString()
          }
        }
      ]
    };

    scriptTag.text = JSON.stringify(structuredData);

  }, [settings, language, seo, ebooks]);

  return null;
};
