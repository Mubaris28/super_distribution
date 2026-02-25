# Super Distribution — Website Audit Report

**Date:** February 2026  
**Scope:** Defects, improvements, and additions across the project.

---

## 1. DEFECTS (Bugs & issues to fix)

### 1.1 Mobile menu overlay not blocking on some pages — **FIXED**
- **Issue:** CSS used `.mobile-menu-overlay.active` but several pages (contact, reseller, compostable, household, etc.) use inline scripts that add `.open` to the overlay. The overlay never got the dark background or `pointer-events: all`, so tapping outside didn’t close the menu and the overlay didn’t dim.
- **Fix applied:** CSS now supports both `.mobile-menu-overlay.open` and `.mobile-menu-overlay.active` with the same styles.

### 1.2 Footer links point to `#` (placeholder)
- **Where:** `index.html` footer — "Fabric Whitener 800ml", "Fabric Whitener 2L", "Powder 500g & 1kg", "Laundry Soap 150g", "Detergent Soap 110g", "About Us", "Become a Partner", "Careers", "Contact", "Privacy Policy" all use `href="#"`.
- **Impact:** Bad UX and poor SEO; users and crawlers can’t reach real pages.
- **Action:** Replace with real URLs (e.g. `products.html?cat=household`, `about.html`, `contact.html`, add `privacy-policy.html` or remove until it exists, add/remove Careers as needed).

### 1.3 Social links are placeholders
- **Where:** All pages — Facebook, Twitter, WhatsApp, Instagram use `href="#"`.
- **Action:** Replace with real profile URLs or remove until you have them.

### 1.4 Spelling: “Stationary” vs “Stationery”
- **Issue:** “Stationary” means not moving; “Stationery” is paper/office supplies. The category is likely “Stationery”.
- **Where:** Nav, mobile menu, tabs, and `stationary.html` title/content across the site.
- **Action:** If the category is paper/office supplies, rename to “Stationery” (and optionally keep filename `stationary.html` for backwards compatibility or add a redirect).

### 1.5 Product inner page: menu script missing
- **Where:** `products-innerpage/product-ujala-detergent-soap.html` has mobile menu markup but no inline script that wires hamburger/close/overlay. It relies on `main.js`, which does wire them — so it may work, but other product pages have both; worth confirming all product-inner pages close the menu on overlay/link click.

### 1.6 Main.js assumes elements exist
- **Where:** `main.js` uses `document.getElementById('hamburger')`, `getElementById('menuClose')`, `getElementById('menuOverlay')` without null checks before `addEventListener`. On pages that don’t have these (e.g. minimal layout), this can throw and break the rest of the script.
- **Action:** Guard with `if (hamburger)`, `if (menuClose)`, `if (menuOverlay)` before attaching listeners (and same for other global element references).

### 1.7 Home link on non-home pages
- **Where:** `index.html` uses `href="#banner"` for “Home”; other pages use `href="index.html"`. Correct; just ensure `#banner` exists on the homepage (it does).

---

## 2. IMPROVEMENTS (UX, performance, code quality)

### 2.1 Back-to-top button
- **Current:** Only present in `vendor/case-study-haribo-halloween.html`; not on main site pages.
- **Recommendation:** Add a single back-to-top control (e.g. fixed bottom-right) on all main pages, with smooth scroll to top and show/hide on scroll (e.g. visible after ~400px).

### 2.2 Meta description and SEO
- **Current:** Main pages have no `<meta name="description">`, no canonical, no Open Graph/Twitter tags.
- **Recommendation:** Add per-page meta description (e.g. 150–160 chars), canonical URL, and at least `og:title`, `og:description`, `og:url` (and `og:image` if you have a default share image) for better search and social sharing.

### 2.3 Favicon
- **Current:** No favicon link in main site `<head>` (only in vendor case study).
- **Recommendation:** Add `<link rel="icon" ...>` (and optional apple-touch-icon) in a shared snippet or in each main template.

### 2.4 Form feedback and validation
- **Current:** Contact and reseller forms have basic validation and success/error handling.
- **Recommendation:** Consider clearer inline validation messages, loading state on buttons, and optional honeypot or CAPTCHA for spam if needed.

### 2.5 Image optimization
- **Current:** Many images referenced without `width`/`height` or `loading="lazy"` consistently.
- **Recommendation:** Add dimensions where possible to reduce layout shift; use `loading="lazy"` for below-the-fold images; consider WebP/AVIF and responsive `srcset` for key images.

### 2.6 Collection / product image paths
- **Current:** Collection section uses paths like `assets/images/collection/Superbio_producwebsite.png` and `Tissue_picture_for_website.png`. If files are missing or renamed, images break.
- **Recommendation:** Confirm filenames in `assets/images/collection/` match references; add `onerror` fallbacks to a placeholder or category image if desired.

### 2.7 Accessibility (a11y)
- **Recommendations:**
  - Ensure all images have meaningful `alt` text (decorative ones can use `alt=""`).
  - Ensure focus states are visible for nav, buttons, and links (especially after opening/closing search and mobile menu).
  - Use one `<h1>` per page; keep heading order (h1 → h2 → h3) logical.
  - Add `aria-expanded` on hamburger and search button when overlays open/close.
  - If the promo bar is dismissible, give it a proper button and aria-label.

### 2.8 Performance
- **Recommendations:**
  - Preconnect to Google Fonts (already done); consider self-hosting critical fonts if needed.
  - Ensure GSAP/ScrollTrigger are only loaded on pages that use them, or keep as is if used globally.
  - Minimize or split `styles.css` if it’s very large (e.g. critical above-the-fold inlined or loaded first).

### 2.9 Consistency
- **Nav active state:** Ensure the current section is marked (e.g. `.nav-link.active`) on every page so the correct nav item is highlighted.
- **Footer:** Unify footer links and structure across index, contact, about, category pages, and product inner pages (some footers have different links or fewer columns).

---

## 3. ADDITIONS (Missing features / content)

### 3.1 Privacy policy page
- **Current:** Footer links to “Privacy Policy” with `href="#"`.
- **Action:** Add `privacy-policy.html` (or similar) with your policy and link it from the footer on all pages.

### 3.2 Careers page
- **Current:** Index footer has “Careers” with `href="#"`.
- **Action:** Add a simple careers page or remove the link until you have one.

### 3.3 Cookie / consent notice (if required)
- **Current:** No cookie banner or consent mechanism.
- **Action:** If you use non-essential cookies or tracking, add a simple notice and consent (and document in privacy policy).

### 3.4 404 page
- **Current:** No custom 404 found.
- **Action:** Add `404.html` with site nav and a “Back to home” link; configure server to serve it for missing URLs.

### 3.5 Sitemap and robots.txt
- **Current:** Not checked in this audit.
- **Action:** Add `sitemap.xml` and `robots.txt` for SEO and crawlers.

### 3.6 Structured data
- **Current:** No schema.org (Organization, LocalBusiness, Product, etc.).
- **Action:** Add JSON-LD for organization and key pages to improve rich results in search.

### 3.7 WhatsApp / contact CTA
- **Current:** Phone/email in footer and contact page.
- **Action:** If you use WhatsApp for business, add a clear “Chat on WhatsApp” link (e.g. `https://wa.me/23052345678`) in header/footer or as a floating button.

---

## 4. SUMMARY TABLE

| Priority   | Type        | Item                                      | Status / Action        |
|-----------|-------------|-------------------------------------------|------------------------|
| High      | Defect      | Mobile overlay class (open vs active)     | Fixed in CSS           |
| High      | Defect      | Footer `#` links on index                  | Replace with real URLs |
| Medium    | Defect      | Social links `#`                           | Add real URLs or remove|
| Medium    | Improvement | Back-to-top on all pages                  | Add component          |
| Medium    | Improvement | Meta description + OG tags                | Add per page           |
| Medium    | Improvement | Favicon                                   | Add to main templates   |
| Medium    | Improvement | main.js null checks                       | Guard getElementById   |
| Low       | Defect      | “Stationary” → “Stationery” (if intended) | Rename content/links   |
| Low       | Addition    | Privacy policy page                        | Create and link         |
| Low       | Addition    | 404 page                                  | Create and configure    |
| Low       | Addition    | Sitemap / robots.txt                      | Add for SEO             |

---

## 5. FILES TOUCHED IN THIS AUDIT

- **Fixed:** `assets/css/styles.css` — added `.mobile-menu-overlay.open` so overlay works on pages that toggle `.open`.
- **Created:** `AUDIT-REPORT.md` — this report.

If you want, the next step can be implementing the high-priority fixes (footer links, main.js guards, back-to-top, and meta/favicon) in the codebase.
