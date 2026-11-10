# E-Book Storefront & WhatsApp Checkout System (cPanel Ready)

A modern, high-performance digital bookstore designed for cPanel hosting deployment. Users can instantly download free e-books, preview books in a reader modal, and order paid e-books via an automated WhatsApp business order message with bKash/Nagad/Rocket payment details. Store administrators can manage books and export `products.json` directly from a built-in admin dashboard.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed based on your requirements and preferences:

- **Payment Methods & Currency**: Pre-configured for Bangladesh Mobile Banking (**bKash**, **Nagad**, **Rocket**) with **BDT (৳)** currency formatting. WhatsApp order messages are pre-structured with Book Title, Price, Customer Details, Payment Method, and Transaction ID (TrxID).
- **Catalog Architecture (`products.json`)**: Ebooks are read directly from `products.json`. A built-in, password-protected **Admin Catalog Studio** allows adding, editing, filtering, and 1-click exporting of the updated `products.json` to upload to your cPanel `public_html` directory.
- **Storefront Aesthetics**: Modern sleek digital bookstore with responsive light/dark dual themes, 3-column book card showcase, clean unboxed typographic metadata, and an interactive **Quick Preview Reader Modal**.
- **cPanel Deployment**: Fully optimized static web architecture (HTML/CSS/JS + JSON) ready to be built and uploaded directly into any cPanel shared hosting environment without backend server dependencies.

---

## 1. Overview & Core Concept

### What It Does
- **E-Book Showcase & Discovery**: Categorized browsing (All, Free, Paid, Business, Programming, Self-Help, Fiction) with instant live search and sort (Price, Newest, Title).
- **Direct Free Downloads**: Instant 1-click download of free e-books directly from the browser (with sample PDF/EPUB generation and custom download URL support).
- **Sample Reader Preview**: An interactive reading drawer/modal that lets users read chapter previews, inspect the table of contents, and review book specs (page count, format, language) before buying.
- **WhatsApp Order Flow**: A structured 2-step purchase modal:
  1. Shows merchant payment numbers (bKash/Nagad/Rocket personal or merchant numbers).
  2. Buyer enters their Name, Phone number, and Payment Transaction ID (TrxID).
  3. Clicks "Order via WhatsApp" — opens your WhatsApp business chat with a pre-formatted, ready-to-send verification message.
  4. You verify the payment in your mobile wallet and dispatch the paid e-book link or file directly in WhatsApp!
- **Admin Catalog & JSON Generator**: Allows you to add/edit/delete e-books, configure WhatsApp phone number and payment wallet numbers, and download the updated `products.json` with a single click.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ User Lands on Storefront ]
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[ Free E-Book ]             [ Paid E-Book ]
   │                               │
   ├─► Click "Preview"             ├─► Click "Preview"
   │   (Reads chapter excerpt)     │   (Reads chapter excerpt)
   │                               │
   └─► Click "Download Free"       └─► Click "Buy via WhatsApp"
       (Immediate file download)           │
                                   ┌───────┴────────────────────────┐
                                   ▼                                ▼
                            [ Step 1: Payment ]              [ Step 2: Order ]
                            Copy bKash/Nagad number          Enter Name & TrxID
                            Send payment on mobile           Generate WhatsApp link
                                                                    │
                                                                    ▼
                                                            [ WhatsApp Chat Opens ]
                                                            You verify TrxID & deliver!
```

### Visual Identity & Theme
- **Aesthetic Direction**: Modern sleek digital bookstore with clean layout density, refined typography, and tactile book cover card treatments.
- **Color Palette & Discipline (60-30-10)**:
  - **Canvas (60%)**: Light mode `bg-slate-50`, Dark mode `bg-slate-950`.
  - **Surfaces (30%)**: Clean cards with `bg-white dark:bg-slate-900` and hairline border `border-slate-200 dark:border-slate-800`.
  - **Accent Budget (10%)**: WhatsApp Emerald (`#25D366` / `emerald-600`) for checkout conversion CTAs, and Indigo/Slate for storefront interactions.
- **Typography & Scale**:
  - Display / Headings: `Plus Jakarta Sans` for clean, modern readability (`clamp(2rem, 3.5vw, 3rem)`).
  - Body & Excerpts: `DM Sans` for comfortable long-form text reading in the sample reader.
  - Pricing & Numbers: Tabular figures (`tabular-nums`) with `৳` symbol.
- **Anti-Slop Discipline**:
  - No static pill capsules around tags; clean typographic separators (`·`).
  - No fake AI status tickers or arbitrary scores.
  - Fully functional light/dark mode switch using Tailwind v4 `@custom-variant dark`.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Catalog Storage** | `public/products.json` + `localStorage` override | Allows direct drop-in onto cPanel hosting; instant static load without server databases. | Cloud database (overkill for cPanel static hosting and requires monthly cloud billing). |
| **Payment Flow** | WhatsApp Click-to-Chat with pre-filled TrxID | Seamless for Bangladesh ecommerce (bKash/Nagad/Rocket); zero gateway transaction fees, zero complex merchant API approvals. | Automated payment gateway (requires trade license, merchant API fees, and complex webhook server setup). |
| **Admin Management** | In-store Admin Modal with JSON Export & Local Persistence | Allows editing titles, prices, descriptions, and downloading updated `products.json` file to upload to cPanel. | Pure text editor editing (error-prone for non-technical users if JSON syntax breaks). |
| **Free Downloads** | Direct file download or dynamically generated formatted PDF/text ebook | Free ebooks start downloading immediately with browser download trigger; no signup walls. | Gated email subscription (adds friction for free downloads). |

---

## 4. Technical Architecture & Data Strategy

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│                                                             │
│  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Storefront View │  │  Preview Reader │  │ WhatsApp    │ │
│  │  - Book Grid     │  │  - Book Excerpt │  │ Checkout    │ │
│  │  - Category Filter│ │  - Specs & TOC  │  │ - bKash/Nagad│ │
│  │  - Search & Sort │  │  - Direct D/L   │  │ - TrxID Form│ │
│  └─────────┬────────┘  └─────────────────┘  └──────┬──────┘ │
│            │                                       │        │
│            ▼                                       ▼        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Book Catalog Store / Context            │  │
│  │   Reads: `products.json` (or cached localStorage)     │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Admin Studio & JSON Exporter            │  │
│  │   - Add / Edit / Remove E-books                       │  │
│  │   - Update Store WhatsApp & bKash numbers             │  │
│  │   - 1-Click "Download products.json" for cPanel       │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │   cPanel / Web Host Root    │
              │   - index.html              │
              │   - assets/ (JS/CSS)        │
              │   - products.json           │
              │   - ebooks/ (PDF/EPUB files)│
              └─────────────────────────────┘
```

### `products.json` Data Model

```json
[
  {
    "id": "ebook-001",
    "title": "Mastering Modern Web Development",
    "author": "Tahsin Islam",
    "category": "Programming",
    "type": "paid",
    "price": 450,
    "currency": "BDT",
    "originalPrice": 650,
    "rating": 4.9,
    "pages": 284,
    "language": "English",
    "format": "PDF + EPUB",
    "coverImage": "https://...",
    "shortDescription": "A complete hands-on guide to building modern full-stack web applications.",
    "description": "Full description of topics covered, chapters, and practical real-world exercises...",
    "previewExcerpt": "Chapter 1: The Core Foundations\nModern software development is not merely about writing code...",
    "downloadUrl": "/ebooks/mastering-web-dev.pdf",
    "fileSize": "14.2 MB",
    "featured": true
  }
]
```

### WhatsApp Message Template
The checkout button creates a clean formatted URI:
```
https://wa.me/8801XXXXXXXXX?text=🛍️%20*New%20E-Book%20Order*%0A%0A*Book:*%20Mastering%20Modern%20Web%20Development%0A*Price:*%20৳450%20BDT%0A%0A*Customer%20Details:*%0A- Name:%20John%20Doe%0A- Phone:%20017XXXXXXXX%0A%0A*Payment%20Verification:*%0A- Method:%20bKash%20(Send%20Money)%0A- TrxID:%209K82JD82N%0A%0APlease%20verify%20and%20send%20the%20e-book%20download%20link.%20Thank%20you!
```

---

## 5. Execution Plan & Deliverables

1. **Catalog Setup & Seed Data (`public/products.json`)**:
   - Provide a realistic, diverse set of e-books (Programming, Business, Freelancing, Design, Fiction) with both Free and Paid products.
2. **Bookstore Header & Navigation**:
   - Top Bar Contract (Wordmark brand, Search & category tabs, Theme toggle & Admin access).
3. **High-Converting Storefront Grid**:
   - Category filters (All, Free, Paid, Programming, Business, etc.), search input, and sorting.
   - Distinctive book cards with cover art, author, page count, format, price/free badge, and action buttons.
4. **Interactive Quick Preview Reader Modal**:
   - Allows users to read sample chapters and view book specifications directly in a cozy reading modal.
5. **WhatsApp Checkout & Mobile Banking Modal**:
   - Payment instruction tab (bKash personal/merchant, Nagad, Rocket numbers with copy buttons).
   - Form fields for customer name, mobile, and transaction ID.
   - Real-time preview of the message and direct WhatsApp redirection link.
6. **Direct Free Download Engine**:
   - Downloads sample e-book files or user-provided PDF links instantly.
7. **In-Store Admin Catalog Manager**:
   - Add new books with custom covers, prices, descriptions, and file URLs.
   - Edit existing items and delete books.
   - Configure WhatsApp business phone number and mobile banking wallet numbers.
   - 1-Click "Download Updated products.json" with cPanel file manager deployment instructions.
8. **Responsive Design & Dark/Light Mode**:
   - Verified on mobile and 1440px desktop baselines.
