import { Ebook, StoreSettings, Coupon } from '../types/ebook';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "KitabGhar",
  storeNameBn: "কিতাবঘর (KitabGhar)",
  storeTagline: "Your Ultimate Book Home",
  storeTaglineBn: "আপনার বইয়ের নির্ভরযোগ্য ঠিকানা (Your Ultimate Book Home)",
  logoUrl: "/assets/aistudio/1794301559714_e54adc4f.jpg",
  whatsappNumber: "8801700968369", // User's requested business WhatsApp number
  whatsappDisplayNumber: "+880 1700-968369",
  bkashNumber: "01712-455726", // User's exact bKash number
  bkashType: "Personal",
  nagadNumber: "01700-968369", // User's exact Nagad number
  nagadType: "Personal",
  currencySymbol: "৳",
  adminUsername: "tahsinislam",
  adminPasscode: "tahsinislam4567", // User's requested admin password
  seo: {
    metaTitle: "KitabGhar - Digital E-Book Store | Free & Paid E-Books",
    metaTitleBn: "কিতাবঘর - ডিজিটাল ই-বুক স্টোর ও হোয়াটসঅ্যাপ অর্ডার",
    metaDescription: "Download free curated e-books or buy premium guides with instant WhatsApp ordering and bKash/Nagad verification in Bangladesh.",
    metaDescriptionBn: "ফ্রি ও পেইড বাংলা-ইংরেজি ই-বুক ডাউনলোড করুন। বিকাশ ও নগদ পেমেন্ট ভেরিফিকেশন সহ হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন।",
    ogTitle: "KitabGhar - Your Ultimate Book Home",
    ogTitleBn: "কিতাবঘর - আপনার বইয়ের নির্ভরযোগ্য ঠিকানা",
    ogDescription: "Discover high-impact programming, freelancing, and business e-books. Instant free downloads and 1-click WhatsApp checkout.",
    ogDescriptionBn: "প্রোগ্রামিং, ফ্রিল্যান্সিং ও ক্যারিয়ার বিষয়ক সেরা ই-বুক সংগ্রহ। ফ্রি ডাউনলোড এবং বিকাশ ও নগদে সহজ হোয়াটসঅ্যাপ অর্ডার।",
    ogImage: "/assets/aistudio/1794301559714_e54adc4f.jpg",
    keywords: "kitabghar, bangla ebook, free ebook download, pdf download bangladesh, bkash payment, nagad payment, programming books, freelancing bangla, startup playbook, কিতাবঘর, বাংলা বই",
    author: "Tahsin Islam",
    canonicalUrl: "",
    twitterHandle: "@kitabghar",
    siteName: "KitabGhar"
  },
  coupons: [
    {
      code: "KITAB20",
      discountType: "percentage",
      discountValue: 20,
      description: "20% Discount on all paid e-books",
      descriptionBn: "সব পেইড ই-বুকে ২০% বিশেষ ছাড়",
      isActive: true
    },
    {
      code: "TAHSIN50",
      discountType: "fixed",
      discountValue: 50,
      description: "Flat ৳50 Discount",
      descriptionBn: "ফ্ল্যাট ৫০ টাকা নগদ ছাড়",
      isActive: true
    },
    {
      code: "EID2026",
      discountType: "percentage",
      discountValue: 25,
      description: "25% Special Festive Discount",
      descriptionBn: "২৫% উৎসব স্পেশাল ছাড়",
      isActive: true
    },
    {
      code: "FIRST20",
      discountType: "percentage",
      discountValue: 20,
      description: "20% Bonus Gift Discount for First Paid Order",
      descriptionBn: "প্রথম পেইড অর্ডারে ২০% থ্যাঙ্ক-ইউ গিফট ছাড়",
      isActive: true
    }
  ],
  flashSale: {
    enabled: true,
    badgeBn: "আজকের ফ্ল্যাশ সেল",
    badgeEn: "Today Flash Deal",
    textBn: "স্পেশাল কুপন কোড দিয়ে যেকোনো পেইড বইয়ে ২০% স্পেশাল ছাড়!",
    textEn: "Use promo code for Flat 20% Instant Discount on any paid book!",
    promoCode: "KITAB20"
  },
  authorStory: {
    enabled: true,
    founderName: "Tahsin Islam",
    founderNameBn: "তাহসিন ইসলাম (Tahsin Islam)",
    founderRole: "Founder & Curator, KitabGhar",
    founderRoleBn: "প্রতিষ্ঠাতা ও প্রধান কিউরেটর, কিতাবঘর",
    headline: "Empowering Curious Minds Across Bangladesh",
    headlineBn: "জ্ঞানের আলো ছড়িয়ে দিতেই কিতাবঘরের সৃষ্টি",
    bio: "KitabGhar was founded with a singular mission: to make premium programming, freelancing, and self-growth knowledge accessible to every Bangladeshi reader without needing international credit cards. With seamless bKash/Nagad verification and 1-click downloads, your reading journey starts here.",
    bioBn: "বাংলাদেশে আন্তর্জাতিক মানের প্রযুক্তি, প্রোগ্রামিং, ফ্রিল্যান্সিং ও ক্যারিয়ার বিষয়ক ই-বুক সংগ্রহ করা অনেক সময় সাধারণ পাঠকদের জন্য বেশ কঠিন হয়ে দাঁড়ায়। কিতাবঘর তৈরি করা হয়েছে যাতে কোনো ক্রেডিট কার্ড বা ঝামেলা ছাড়াই প্রতিটি শিক্ষার্থী ও পাঠক সহজে বিকাশ ও নগদের মাধ্যমে নির্বাচিত বাংলা ও ইংরেজি ই-বুক সংগ্রহ করতে পারেন এবং সরাসরি ফ্রিতেও সেরা বইগুলো পড়তে পারেন।"
  },
  showBundlesSection: true,
  bundles: [
    {
      id: "bundle-dev",
      name: "Developer & AI Super Combo",
      nameBn: "প্রোগ্রামার ও এআই সুপার কম্বো প্যাক",
      tagline: "Python, Modern Web & Next-Gen AI Mastery in 2 Complete E-Books",
      taglineBn: "পাইথন, আধুনিক ওয়েব আর্কিটেকচার এবং এআই মাস্টারি একসাথে",
      bookIds: ["ebook-001", "ebook-003"],
      originalPrice: 750,
      bundlePrice: 520,
      savings: 230,
      badge: "Save 30%",
      badgeBn: "৩০% সাশ্রয়ী"
    },
    {
      id: "bundle-career",
      name: "Freelancing & Business Master Bundle",
      nameBn: "ফ্রিল্যান্সার ও অনলাইন উদ্যোক্তা কম্বো বান্ডেল",
      tagline: "Step-by-step freelancing dollar income guide + Startup playbook",
      taglineBn: "আন্তর্জাতিক মার্কেটপ্লেসে ডলার ইনকাম ও স্টার্টআপ তৈরির কৌশল",
      bookIds: ["ebook-002", "ebook-004"],
      originalPrice: 850,
      bundlePrice: 590,
      savings: 260,
      badge: "Popular Combo",
      badgeBn: "জনপ্রিয় কম্বো"
    }
  ],
  showFaqSection: true,
  faqs: [
    {
      id: "faq-1",
      question: "How do I pay via bKash or Nagad?",
      questionBn: "বিকাশ বা নগদের মাধ্যমে কীভাবে পেমেন্ট করব?",
      answer: 'Select any paid e-book and click "Buy via WhatsApp". In the modal, you will see our verified personal bKash (01712-455726) and Nagad (01700-968369) numbers. Send Money the exact amount from your bKash/Nagad app, copy the Transaction ID (TrxID) or attach a screenshot, and click "Send Order via WhatsApp".',
      answerBn: 'যে বইটি কিনতে চান তার "হোয়াটসঅ্যাপে কিনুন" বাটনে ক্লিক করুন। পপআপে আমাদের বিকাশ পার্সোনাল (০১৭১২-৪৫৫৭২৬) এবং নগদ পার্সোনাল (০১৭০০-৯৬৮৩৬৯) নম্বর পেয়ে যাবেন। আপনার বিকাশ বা নগদ অ্যাপ থেকে "Send Money" করে TrxID অথবা পেমেন্ট স্ক্রিনশট বক্সে বসিয়ে "হোয়াটসঅ্যাপে অর্ডার পাঠান" বাটনে ক্লিক করলেই আপনার হোয়াটসঅ্যাপ ওপেন হবে।'
    },
    {
      id: "faq-2",
      question: "How quickly will I receive the e-book on WhatsApp?",
      questionBn: "অর্ডার করার কতক্ষণ পর বইয়ের ডাউনলোড লিংক পাব?",
      answer: "Our support team monitors WhatsApp 24/7. Once we verify your TrxID or screenshot (typically within 2 to 10 minutes), we will immediately reply with your high-speed Google Drive / Direct PDF download link.",
      answerBn: "আমাদের হোয়াটসঅ্যাপ টিম নিয়মিত পেমেন্ট যাচাই করে। আপনার TrxID বা স্ক্রিনশট কনফার্ম হওয়ার মাত্র ২ থেকে ১০ মিনিটের মধ্যে সরাসরি হোয়াটসঅ্যাপ চ্যাটে আপনার হাই-স্পিড গুগল ড্রাইভ বা ডিরেক্ট পিডিএফ ডাউনলোড লিংক পাঠিয়ে দেওয়া হবে।"
    },
    {
      id: "faq-3",
      question: "Can I read these e-books on mobile, tablet, and PC without extra apps?",
      questionBn: "বইগুলো কি মোবাইল ও ল্যাপটপে সহজে পড়া যাবে? কোনো বাড়তি অ্যাপ লাগবে কি?",
      answer: "Yes! All e-books are delivered in standard, high-quality PDF and EPUB formats. You can read them directly on Android, iPhone/iPad, Windows, and Mac using any built-in PDF viewer or browser without requiring desktop mode.",
      answerBn: "হ্যাঁ, অবশ্যই! প্রতিটি ই-বুক ক্রিস্টাল ক্লিয়ার পিডিএফ (PDF) ও ই-পাব (EPUB) ফরম্যাটে তৈরি। আপনি যেকোনো অ্যান্ড্রয়েড মোবাইল, আইফোন, ট্যাবলেট কিংবা ল্যাপটপে সাধারণ PDF ভিউয়ার বা ব্রাউজারে অনায়াসে পড়তে পারবেন।"
    },
    {
      id: "faq-4",
      question: "How do free e-books work? Are they completely free?",
      questionBn: "ফ্রি ই-বুকগুলো কি সত্যিই সম্পূর্ণ বিনামূল্যে পাওয়া যাবে?",
      answer: 'Yes! All e-books marked with a green "Free" badge can be downloaded instantly with 1-click. No signup, registration, credit card, or payment is required. You can also preview sample chapters right on this website.',
      answerBn: 'হ্যাঁ, ১০০% ফ্রি! যেসব বইতে সবুজ "ফ্রি" ব্যাজ রয়েছে, সেগুলোতে "ফ্রি ডাউনলোড" বাটনে ক্লিক করা মাত্রই আপনার ডিভাইসে সরাসরি প্রিন্টেবল পিডিএফ/এইচটিএমএল ফাইল ডাউনলোড শুরু হয়ে যাবে। কোনো একাউন্ট খোলা বা সাইন-আপ করতে হবে না।'
    },
    {
      id: "faq-5",
      question: "How do discount coupons work?",
      questionBn: "কুপন বা ডিসকাউন্ট কোড কীভাবে ব্যবহার করব?",
      answer: 'During checkout, enter promotional promo codes like "KITAB20" (for 20% off) or "TAHSIN50" (for ৳50 flat discount) into the coupon box and click "Apply". The discounted price will automatically be reflected in your total payable amount and formatted WhatsApp message.',
      answerBn: 'পেইড বইয়ের চেকআউট করার সময় কুপন বক্সে "KITAB20" (২০% ছাড়) বা "TAHSIN50" (৳৫০ ফ্ল্যাট ছাড়) লিখে "প্রয়োগ করুন" চাপলে সাথে সাথে মোট মূল্য কমে যাবে এবং হোয়াটসঅ্যাপ মেসেজেও ছাড় হিসাব হয়ে যাবে।'
    },
    {
      id: "faq-6",
      question: "What if I encounter an issue with payment or download link?",
      questionBn: "পেমেন্ট বা ডাউনলোড করতে কোনো সমস্যা হলে কী করব?",
      answer: "KitabGhar offers 100% money-back guarantee. If you face any trouble downloading or opening the file, message us directly on WhatsApp (+880 1700-968369) with your screenshot, and we will resolve it immediately or replace the link.",
      answerBn: "কিতাবঘরে পাঠকদের সন্তুষ্টি প্রথম অগ্রাধিকার। কোনো ফাইল ওপেন করতে বা লিংক পেতে সমস্যা হলে সরাসরি আমাদের অফিশিয়াল হোয়াটসঅ্যাপ (+৮৮০ ১৭০০-৯৬৮৩৬৯) নম্বরে মেসেজ করুন, তাৎক্ষণিক সমাধান দেওয়া হবে।"
    }
  ],
  showLiveSalesPopup: true,
  liveSales: [
    {
      id: "s1",
      buyerName: "Hasib Rahman",
      buyerNameBn: "হাসিব রহমান",
      district: "Mirpur, Dhaka",
      districtBn: "মিরপুর, ঢাকা",
      bookTitle: "Modern Web Architecture",
      bookTitleBn: "মডার্ন ওয়েব আর্কিটেকচার",
      timeAgo: "3 minutes ago",
      timeAgoBn: "৩ মিনিট আগে",
      bookId: "ebook-001"
    },
    {
      id: "s2",
      buyerName: "Tanveer Ahmed",
      buyerNameBn: "তানভীর আহমেদ",
      district: "Agrabad, Chittagong",
      districtBn: "আগ্রাবাদ, চট্টগ্রাম",
      bookTitle: "Remote Work & Freelancing Blueprint",
      bookTitleBn: "রিমোট ওয়ার্ক ও ফ্রিল্যান্সিং ব্লুপ্রিন্ট",
      timeAgo: "7 minutes ago",
      timeAgoBn: "৭ মিনিট আগে",
      bookId: "ebook-002"
    },
    {
      id: "s3",
      buyerName: "Nusrat Jahan",
      buyerNameBn: "নুসরাত জাহান",
      district: "Uttara, Dhaka",
      districtBn: "উত্তরা, ঢাকা",
      bookTitle: "Zero to Scale: Modern Business Growth",
      bookTitleBn: "জিরো টু স্কেল: আধুনিক ব্যবসা সম্প্রসারণ গাইড",
      timeAgo: "12 minutes ago",
      timeAgoBn: "১২ মিনিট আগে",
      bookId: "ebook-004"
    },
    {
      id: "s4",
      buyerName: "Mahmudul Hasan",
      buyerNameBn: "মাহমুদুল হাসান",
      district: "Zindabazar, Sylhet",
      districtBn: "জিন্দাবাজার, সিলেট",
      bookTitle: "Modern Web Architecture",
      bookTitleBn: "মডার্ন ওয়েব আর্কিটেকচার",
      timeAgo: "18 minutes ago",
      timeAgoBn: "১৮ মিনিট আগে",
      bookId: "ebook-001"
    }
  ],
  showReviewsSection: true,
  downloadGiftCouponCode: "FIRST20"
};

export const DEFAULT_EBOOKS: Ebook[] = [
  {
    id: "ebook-001",
    title: "Modern Web Architecture: Scalable & Resilient Systems",
    titleBn: "মডার্ন ওয়েব আর্কিটেকচার: স্কেলেবল ও রেজিলিয়েন্ট সিস্টেম",
    author: "Alexander D. Chen",
    authorBn: "আলেকজান্ডার ডি. চেন",
    category: "Programming",
    categoryBn: "প্রোগ্রামিং",
    type: "paid",
    price: 450,
    originalPrice: 750,
    currency: "BDT",
    rating: 4.9,
    pages: 310,
    language: "English + বাংলা গাইড",
    format: "PDF + EPUB",
    coverImage: "/src/assets/images/book_cover_web_dev_1794299826686.jpg",
    shortDescription: "Master full-stack system architecture, micro-frontends, caching layers, and high-performance React design patterns.",
    shortDescriptionBn: "ফুলস্ট্যাক সিস্টেম আর্কিটেকচার, মাইক্রো-ফ্রন্টএন্ড, ক্যাশিং ও হাই-পারফরম্যান্স রিয়্যাক্ট সফটওয়্যার ডিজাইন প্যাটার্ন শিখুন।",
    description: "A comprehensive practical guide for developers moving to senior and lead engineering roles. Covers system decomposition, resilient caching, asynchronous queues, security best practices, and production CI/CD workflows.",
    descriptionBn: "সিনিয়র ইঞ্জিনিয়ার ও টিম লিডদের জন্য একটি বাস্তবমুখী গাইড। বড় মাপের সিস্টেম ডিজাইন, ক্যাশিং স্ট্র্যাটেজি, অ্যাসিঙ্ক কিউ এবং প্রোডাকশন সিআই/সিডি আর্কিটেকচার নিয়ে পূর্ণাঙ্গ আলোচনা।",
    previewExcerpt: "Chapter 1: The Anatomy of Modern Frontends\n\nBuilding resilient web systems starts with understanding boundaries. For over a decade, frontend engineering was treated as an afterthought—a decorative skin stretched over an API. Today, web applications are complex distributed systems running directly on billions of client devices worldwide.\n\nKey Principles of Resilience:\n1. Graceful Degradation: Never let an offline state crash the user interface.\n2. State Authoritativeness: Cache deterministically, invalidate deliberately.\n3. Latency Budgets: Compute first paint within 100ms and defer secondary data.",
    previewExcerptBn: "১ম অধ্যায়: আধুনিক ফ্রন্টএন্ড আর্কিটেকচারের মূল ভিত্তি\n\nএকটি শক্তিশালী ওয়েব সিস্টেম তৈরি করার প্রথম শর্ত হলো সঠিক সীমানা নির্ধারণ করা। দীর্ঘ সময় ধরে ফ্রন্টএন্ডকে শুধুমাত্র এপিআই-এর ওপর এক পাতলা আবরণ হিসেবে বিবেচনা করা হতো। কিন্তু আজকের দিনে প্রতিটি ব্রাউজার ও মোবাইল ডিভাইস নিজেই একটি জটিল ডিস্ট্রিবিউটেড ক্লায়েন্ট কম্পিউটিং পরিবেশ।\n\nরেজিলিয়েন্সের ৩টি মূল নীতি:\n১. গ্রেসফুল ডিগ্রেডেশন: দুর্বল নেটওয়ার্কেও যেন ব্যবহারকারীর অভিজ্ঞতা ভেঙে না পড়ে।\n২. স্টেট অথরিটি: ক্যাশ করুন সুনির্দিষ্টভাবে, ইনভ্যালিডেট করুন সতর্কতার সাথে।\n৩. লেটেন্সি বাজেট: প্রথম রেন্ডার সম্পন্ন করুন ১০০ মিলি-সেকেন্ডের ভেতরে।",
    tableOfContents: [
      "01. Architectural Paradigms & Distributed Clients",
      "02. Modern State Machines & Predictive Caching",
      "03. Edge Rendering, SSR & Hydration Mechanics",
      "04. Resilient APIs & Fault-Tolerant Networking",
      "05. Performance Profiling, Memory Leaks & Production Monitoring"
    ],
    tableOfContentsBn: [
      "০১. আর্কিটেকচারাল প্যাটার্ন ও ডিস্ট্রিবিউটেড ক্লায়েন্ট",
      "০২. মডার্ন স্টেট মেশিন ও প্রিডিক্টিভ ক্যাশিং",
      "০৩. এজ রেন্ডারিং ও এসএসআর মেকানিক্স",
      "০৪. রেজিলিয়েন্ট এপিআই ও নেটওয়ার্কিং",
      "০৫. পারফরম্যান্স প্রোফাইলিং ও প্রোডাকশন মনিটরিং"
    ],
    fileSize: "14.8 MB",
    featured: true
  },
  {
    id: "ebook-002",
    title: "Remote Work & Freelancing Blueprint",
    titleBn: "রিমোট ওয়ার্ক ও ফ্রিল্যান্সিং ব্লুপ্রিন্ট",
    author: "Sarah J. Reed",
    authorBn: "সারাহ জে. রিড",
    category: "Freelancing",
    categoryBn: "ফ্রিল্যান্সিং",
    type: "paid",
    price: 350,
    originalPrice: 500,
    currency: "BDT",
    rating: 4.8,
    pages: 224,
    language: "English + বাংলা সামারি",
    format: "PDF + EPUB + Audio Notes",
    coverImage: "/src/assets/images/book_cover_bangla_freelancing_1794299826372.jpg",
    shortDescription: "The step-by-step roadmap to finding high-ticket international clients, client communication, and financial freedom.",
    shortDescriptionBn: "বাংলাদেশ থেকে আন্তর্জাতিক ক্লায়েন্ট পাওয়া, প্রপোজাল তৈরি, প্রাইসিং এবং ফ্রিল্যান্সিংয়ে টেকসই ক্যারিয়ার গড়ার রোডম্যাপ।",
    description: "Unlock high-paying global remote contracts. Learn proposal formulas that convert, pricing psychologies that eliminate hourly traps, negotiation tactics, and international tax and payment workflows tailored for modern remote professionals.",
    descriptionBn: "গ্লোবাল রিমোট জবে নিজেকে প্রতিষ্ঠিত করার পূর্ণাঙ্গ নির্দেশিকা। কম রেটে বিডিং না করে কীভাবে ভ্যালু-বেসড প্রাইসিং করবেন এবং দীর্ঘমেয়াদী ক্লায়েন্ট রিটেইন করবেন তা হাতে-কলমে ব্যাখ্যা করা হয়েছে।",
    previewExcerpt: "Chapter 1: Breaking Out of the Upwork Bidding Race\n\nThe biggest mistake beginner freelancers make is competing on price. When you enter an open marketplace and offer $10/hour, you inadvertently signal low quality to serious clients.\n\nHigh-value clients do not buy hours. They buy outcomes, speed, and peace of mind.",
    previewExcerptBn: "১ম অধ্যায়: কম দামের বিডিং প্রতিযোগিতা থেকে মুক্তি\n\nনতুন ফ্রিল্যান্সারদের সবচেয়ে বড় ভুল হলো মূল্যের দিক থেকে প্রতিযোগিতা করা। যখন আপনি কোনো প্রজেক্টে অস্বাভাবিক কম রেট অফার করেন, আন্তর্জাতিক বায়াররা আপনার কাজের মান নিয়ে সন্দিহান হয়ে পড়ে।\n\nবড় ক্লায়েন্টরা সময় কেনে না; তারা কেনে ফলাফল, গতি এবং মানসিক প্রশান্তি। একজন স্পেশালিস্ট হিসেবে নিজেকে উপস্থাপন করাই আয়ের মূল চাবিকাঠি।",
    tableOfContents: [
      "01. The Specialized Positioning Matrix",
      "02. Cold Outreach & Inbound Authority Building",
      "03. High-Converting Pitch Proposals & Discovery Calls",
      "04. Value-Based Pricing vs. Hourly Traps",
      "05. Scaling from Solo Freelancer to Studio Agency"
    ],
    tableOfContentsBn: [
      "০১. স্পেশালাইজড পজিশনিং ম্যাট্রিক্স",
      "০২. কোল্ড ইমেইল ও ক্লায়েন্ট আউটরিচ",
      "০৩. হাই-কনভার্টিং প্রপোজাল লেখার নিয়ম",
      "০৪. ভ্যালু-বেসড প্রাইসিংয়ের গোপন সূত্র",
      "০৫. সলো ফ্রিল্যান্সার থেকে স্টুডিও এজেন্সি"
    ],
    fileSize: "9.2 MB",
    featured: true
  },
  {
    id: "ebook-003",
    title: "Python & AI Foundations: Modern Machine Learning",
    titleBn: "পাইথন ও এআই ফাউন্ডেশন: মেশিন লার্নিং নির্দেশিকা",
    author: "Dr. Evelyn Reed & John S. Carter",
    authorBn: "ড. এভলিন রিড ও জন এস. কার্টার",
    category: "Programming",
    categoryBn: "প্রোগ্রামিং",
    type: "free",
    price: 0,
    currency: "BDT",
    rating: 4.9,
    pages: 196,
    language: "English",
    format: "PDF",
    coverImage: "/src/assets/images/book_cover_python_ai_1794299838290.jpg",
    shortDescription: "A complete beginner-friendly open handbook on Python programming, NumPy, Pandas, and neural network basics.",
    shortDescriptionBn: "পাইথন প্রোগ্রামিং, নামপাই, প্যান্ডাস এবং আধুনিক আর্টিফিশিয়াল ইন্টেলিজেন্সের মৌলিক ধারণার ফ্রি উন্মুক্ত বই।",
    description: "Completely free open-access textbook. Designed for students, career switchers, and programmers eager to get hands-on experience with modern AI workflows, tensors, prompt engineering, and LLM orchestration.",
    descriptionBn: "শিক্ষার্থী ও ডেভেলপারদের জন্য সম্পূর্ণ বিনামূল্যে ডাউনলোডযোগ্য বই। পাইথন দিয়ে কীভাবে ডেটা প্রসেসিং, নিউরাল নেটওয়ার্ক এবং আধুনিক এলএলএম এপিআই ব্যবহার করবেন তা সহজে বোঝানো হয়েছে।",
    previewExcerpt: "Chapter 1: The Modern AI Landscape\n\nArtificial Intelligence is no longer confined to academic research labs. With modern tensor computing libraries, developers can now build intelligent systems in a single weekend that previously required multi-million-dollar R&D teams.",
    previewExcerptBn: "১ম অধ্যায়: আধুনিক কৃত্রিম বুদ্ধিমত্তা ও পাইথন\n\nকৃত্রিম বুদ্ধিমত্তা এখন আর কেবল গবেষণাগারের বিষয় নয়। পাইথনের সমৃদ্ধ লাইব্রেরিগুলোর কল্যাণে একজন সাধারণ প্রোগ্রামারও এখন নিজের ল্যাপটপ থেকে বুদ্ধিমান সিস্টেম তৈরি করতে পারেন।\n\nচলুন শুরু করা যাক এনভায়রনমেন্ট সেটআপ এবং প্রথম পাইথন স্ক্রিপ্ট দিয়ে।",
    tableOfContents: [
      "01. Python Core Syntax & Data Structures Refresher",
      "02. Data Wrangling with Pandas & Vectorized NumPy",
      "03. Mathematical Intuition: Linear Algebra & Gradient Descent",
      "04. Training Your First Neural Classifier",
      "05. Interfacing with Generative AI APIs & Prompt Engineering"
    ],
    tableOfContentsBn: [
      "০১. পাইথনের মৌলিক সিনট্যাক্স ও ডেটা স্ট্রাকচার",
      "০২. প্যান্ডাস ও নামপাই দিয়ে ডেটা প্রসেসিং",
      "০৩. মেশিন লার্নিংয়ের গণিত ও লিনিয়ার অ্যালজেব্রা",
      "০৪. প্রথম নিউরাল নেটওয়ার্ক তৈরি ও ট্রেইনিং",
      "০৫. জেনারেটিভ এআই ও এলএলএম ইন্টিগ্রেশন"
    ],
    downloadUrl: "#",
    fileSize: "11.6 MB",
    featured: true
  },
  {
    id: "ebook-004",
    title: "Zero to Scale: Modern Business Growth",
    titleBn: "জিরো টু স্কেল: আধুনিক ব্যবসা সম্প্রসারণ গাইড",
    author: "Alexandra J. Reed & David M. Chen",
    authorBn: "আলেক্সান্ড্রা জে. রিড ও ডেভিড এম. চেন",
    category: "Business",
    categoryBn: "ব্যবসা ও উদ্যোগ",
    type: "paid",
    price: 500,
    originalPrice: 850,
    currency: "BDT",
    rating: 5.0,
    pages: 268,
    language: "English",
    format: "PDF + EPUB",
    coverImage: "/src/assets/images/book_cover_startup_playbook_1794299826418.jpg",
    shortDescription: "Field-tested playbooks on customer acquisition, unit economics, retention funnels, and sustainable venture growth.",
    shortDescriptionBn: "কাস্টমার অ্যাকুইজিশন, ইউনিট ইকোনমিক্স, রিটেনশন ফানেল এবং লাভজনক উদ্যোগ গড়ার প্র্যাক্টিকাল প্লেবুক।",
    description: "Written by seasoned founders and operators. Zero to Scale breaks down how bootstrap businesses and venture-backed startups acquire their first 1,000 paid customers, optimize unit economics, and build enduring moats without burning out.",
    descriptionBn: "অভিজ্ঞ উদ্যোক্তাদের বাস্তব অভিজ্ঞতা থেকে লেখা বই। কীভাবে প্রথম ১০০০ পেইড গ্রাহক পাবেন, কীভাবে ব্যবসার মার্জিন ও ক্যাশফ্লো ঠিক রাখবেন তার বিশদ বিশ্লেষণ।",
    previewExcerpt: "Chapter 1: The Product-Market Fit Fallacy\n\nMany founders believe product-market fit is a binary switch. In reality, product-market fit is a dynamic gradient that fluctuates as competitors enter and customer expectations evolve.\n\nTrue market pull manifests when your users scream if your product goes down for fifteen minutes.",
    previewExcerptBn: "১ম অধ্যায়: প্রোডাক্ট-মার্কেট ফিটের মূল রহস্য\n\nঅনেক উদ্যোক্তা মনে করেন ব্যবসা শুরু করলেই কাস্টমার পাওয়া যাবে। কিন্তু বাস্তবে মার্কেট ফিট নিশ্চিত করা এক চলমান প্রক্রিয়া।\n\nআপনার সার্ভিস যদি ১৫ মিনিটের জন্য বন্ধ থাকে এবং গ্রাহক অস্থির হয়ে পড়ে, তখনই বুঝবেন আপনি সঠিক প্রোডাক্ট তৈরি করেছেন।",
    tableOfContents: [
      "01. Validating Problem Hypotheses in 14 Days",
      "02. Customer Discovery Without False Positives",
      "03. Distribution First: Building Audience Before Code",
      "04. Unit Economics: CAC, LTV & Payback Velocity",
      "05. Hiring Your First Five Force Multipliers"
    ],
    tableOfContentsBn: [
      "০১. ১৪ দিনে ব্যবসায়িক আইডিয়া ভ্যালিডেশন",
      "০২. কাস্টমার রিসার্চ ও মার্কেট ডিমান্ড বোঝা",
      "০৩. ডিস্ট্রিবিউশন ফার্স্ট: আগে অডিয়েন্স তৈরি",
      "০৪. ইউনিট ইকোনমিক্স: সিএসি ও এলটিভি ব্যালেন্স",
      "০৫. প্রথম ৫ জন দক্ষ টিম মেম্বার নিয়োগ"
    ],
    fileSize: "16.1 MB",
    featured: false
  },
  {
    id: "ebook-005",
    title: "The Minimalist UI Design Handbook",
    titleBn: "দ্য মিনিমালিস্ট ইউআই ডিজাইন হ্যান্ডবুক",
    author: "Marcus Sterling",
    authorBn: "মার্কাস স্টার্লিং",
    category: "Design",
    categoryBn: "ডিজাইন",
    type: "free",
    price: 0,
    currency: "BDT",
    rating: 4.7,
    pages: 142,
    language: "English",
    format: "PDF",
    coverImage: "/src/assets/images/book_cover_minimalist_design_1794299901177.jpg",
    shortDescription: "Essential rules for layout rhythm, typographic scales, micro-spacing, and intentional interface restraint.",
    shortDescriptionBn: "লেআউট রিদম, টাইপোগ্রাফি স্কেল, স্পেসিং ও আধুনিক মিনিমাল ইউজার ইন্টারফেস ডিজাইনের নিখুঁত গাইড।",
    description: "A crisp, visual guide for developers and designers who want to craft interfaces that feel polished, balanced, and timeless. Learn how whitespace, typography pairing, and contrast eliminate the need for decorative visual clutter.",
    descriptionBn: "ডিজাইনার ও ওয়েব ডেভেলপারদের জন্য একটি চমৎকার হ্যান্ডবুক। অপ্রয়োজনীয় উপাদান বাদ দিয়ে কীভাবে মার্জিত ও প্রফেশনাল ডিজিটাল প্রোডাক্ট ডিজাইন করা যায় তা বিস্তারিত বর্ণিত।",
    previewExcerpt: "Chapter 1: The Power of Intentional Subtraction\n\nGreat design is achieved not when there is nothing left to add, but when there is nothing left to take away. In an era saturated with vibrating gradients and chaotic badges, clarity is the ultimate luxury.",
    previewExcerptBn: "১ম অধ্যায়: অপ্রয়োজনীয় উপাদান বাদ দেওয়ার শক্তি\n\nএকটি ইন্টারফেস তখনই সুন্দর দেখায় যখন সেখান থেকে আর কোনো অপ্রয়োজনীয় অংশ বাদ দেওয়ার সুযোগ থাকে না। অপ্রয়োজনীয় বর্ডার বা চকচকে রঙের বদলে স্পেস এবং পরিষ্কার টাইপোগ্রাফি ব্যবহার করাই শ্রেষ্ঠ ডিজাইনারের পরিচয়।",
    tableOfContents: [
      "01. The Philosophy of Intentional Subtraction",
      "02. Spatial Math: The 4pt/8pt Grid System",
      "03. Typographic Pairings & Scale Ratios",
      "04. Color Distribution: The 60-30-10 Rule",
      "05. Designing for Dark Mode Optical Balance"
    ],
    tableOfContentsBn: [
      "০১. মিনিমালিজমের দর্শন ও নিয়মাবলী",
      "০২. স্পেশিয়াল ম্যাথ: ৪ পয়েন্ট ও ৮ পয়েন্ট গ্রিড",
      "০৩. ফন্ট সিলেকশন ও টাইপোগ্রাফি স্কেল",
      "০৪. কালার ডিস্ট্রিবিউশন: ৬০-৩০-১০ সূত্র",
      "০৫. ডার্ক মোড ডিজাইন ও কনট্রাস্ট অপটিমাইজেশন"
    ],
    downloadUrl: "#",
    fileSize: "8.5 MB",
    featured: false
  },
  {
    id: "ebook-006",
    title: "Deep Focus: Habits of Elite Knowledge Workers",
    titleBn: "ডিপ ফোকাস: গভীর মনোযোগ ও কার্যদক্ষতার অভ্যাস",
    author: "Devin Vance",
    authorBn: "ডেভিন ভ্যান্স",
    category: "Self-Help",
    categoryBn: "আত্মউন্নয়ন",
    type: "free",
    price: 0,
    currency: "BDT",
    rating: 4.9,
    pages: 178,
    language: "English",
    format: "PDF + EPUB",
    coverImage: "/src/assets/images/book_cover_deep_focus_1794299901557.jpg",
    shortDescription: "Reclaim cognitive stamina, eliminate notification fatigue, and execute 4 hours of uninterrupted daily deep work.",
    shortDescriptionBn: "মনোযোগের অপচয় বন্ধ করুন, সোশ্যাল মিডিয়ার আসক্তি কমান এবং প্রতিদিন গভীর একাগ্রতায় কাজ করার কৌশল শিখুন।",
    description: "Practical systems to insulate your attention from digital distraction. Understand dopamine baseline economics, time-blocking rituals, and cognitive recovery techniques used by prolific authors and software architects.",
    descriptionBn: "ডিজিটাল বিভ্রান্তির যুগে নিজের উৎপাদনশীলতা বজায় রাখার বিজ্ঞানসম্মত কৌশল। কীভাবে ডোপামিন ড্রাইভ নিয়ন্ত্রণ করবেন এবং টানা কয়েক ঘণ্টা গভীর মনোযোগ ধরে রাখবেন তা শিখুন।",
    previewExcerpt: "Chapter 1: Attention as an Exhaustible Currency\n\nEvery notification you glance at carries a hidden penalty called attention residue. When you spend thirty seconds checking a notification before returning to a complex task, your brain takes between 15 to 23 minutes to regain full cognitive depth.",
    previewExcerptBn: "১ম অধ্যায়: মনোযোগ এক অমূল্য সম্পদ\n\nপ্রতিটি অপ্রয়োজনীয় নোটিফিকেশন আমাদের মস্তিষ্কের গভীর চিন্তার ক্ষমতাকে খণ্ডিত করে দেয়। গবেষণায় দেখা গেছে, কাজের মাঝে ৩০ সেকেন্ডের বিভ্রান্তিও আবার গভীর ধ্যানে ফিরতে ১৫ থেকে ২০ মিনিট সময় নষ্ট করে।",
    tableOfContents: [
      "01. Attention Residue & The Science of Concentration",
      "02. Structuring The 90-Minute Focus Sprint",
      "03. Digital Askesis: Taming Notification Addiction",
      "04. The Physical Environment of Deep Production",
      "05. Cognitive Recovery, Sleep & Longevity"
    ],
    tableOfContentsBn: [
      "০১. মনোযোগ খণ্ডিত হওয়ার বিজ্ঞান ও সমাধান",
      "০২. ৯০ মিনিটের ফোকাস স্প্রিন্ট রুটিন",
      "০৩. ডিজিটাল আসক্তি নিয়ন্ত্রণ ও ডিটক্স",
      "০৪. গভীর কাজের জন্য উপযুক্ত পরিবেশ তৈরি",
      "০৫. মস্তিষ্কের বিশ্রাম ও দীর্ঘমেয়াদী কর্মক্ষমতা"
    ],
    downloadUrl: "#",
    fileSize: "7.3 MB",
    featured: false
  }
];
