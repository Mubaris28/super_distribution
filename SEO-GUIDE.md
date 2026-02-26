# Super Distribution Mauritius – SEO & Search Visibility Guide

This guide helps you get **#1 visibility in Mauritius and internationally** so Google and other search engines recognise Super Distribution as the leading distributor.

---

## What’s already done on the site

- **Homepage (index.html):** Strong title and meta description with “Mauritius”, “#1”, “island-wide”, UJALA, MARGO, Super Bio. Keywords and geo.region (MU).
- **Structured data (Schema.org):** Organization + LocalBusiness JSON-LD on the homepage (name, logo, address, phone, email, opening hours, area served: Mauritius). Helps Google show rich results and local knowledge.
- **Canonical URLs:** Every page has a canonical link to avoid duplicate content.
- **Sitemap:** `sitemap.xml` lists all important pages with priorities and lastmod. Submit this in Search Console.
- **robots.txt:** Allows all crawlers and points to the sitemap. No blocking of important pages.
- **Titles & descriptions:** Home, Products, About, Contact use clear, keyword-rich titles and meta descriptions for Mauritius and brands.

---

## What you should do next (to reach #1)

### 1. Google Search Console (essential)

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property: `https://superdistribution.mu`
3. Verify ownership (HTML file upload or DNS).
4. **Submit sitemap:** Sitemaps → Add sitemap → `https://superdistribution.mu/sitemap.xml`
5. Use “URL Inspection” to ask Google to index the homepage and key pages (Products, Contact, About).

This tells Google your site exists and speeds up indexing of the whole island-wide site.

### 2. Bing Webmaster Tools (international + some local search)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add site `https://superdistribution.mu` and verify.
3. Submit the same sitemap: `https://superdistribution.mu/sitemap.xml`

Helps with Bing and other engines that use Bing data.

### 3. HTTPS (SSL certificate)

- Search engines favour HTTPS. Ensure your host provides an SSL certificate for `superdistribution.mu`.
- In `.htaccess` there are commented lines to force HTTPS. Uncomment them once SSL is active:
  - `RewriteCond %{HTTPS} off`
  - `RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`

### 4. Google Business Profile (Mauritius – local search)

- Create/claim [Google Business Profile](https://business.google.com) for Super Distribution in **Port Louis, Mauritius**.
- Use the same name, address, phone, and hours as on the website (and in the Schema.org data).
- Add website URL: `https://superdistribution.mu`
- Add categories (e.g. “Wholesaler”, “Distributor”).
- Add photos, short posts, and respond to reviews.

This strongly improves “near me” and “Mauritius” searches.

### 5. Content and keywords (ongoing)

- Keep using **“Mauritius”**, **“island-wide”**, **“wholesale”**, **“retail”**, **“UJALA”**, **“MARGO”**, **“Super Bio”** in titles, headings, and body text where it’s natural.
- Add a short “Mauritius” or “Island-wide delivery” section on the homepage or About if you haven’t already.
- Product pages already have unique titles and descriptions; keep them specific to each product and include “Mauritius” or “Super Distribution” where it fits.

### 6. Sitemap maintenance

- When you add or change important pages, update `sitemap.xml` and set `<lastmod>` to the change date (YYYY-MM-DD).
- Re-submit the sitemap in Search Console (or leave it; Google will refetch periodically).

### 7. International searches

- The site is in English with `og:locale` and “Mauritius” in titles/descriptions, which helps both local and international queries (e.g. “UJALA distributor Mauritius”, “Super Bio Mauritius”).
- If you add pages in French later, use `hreflang` and separate or multi-region sitemaps as needed.

---

## Quick checklist

| Task | Done on site? | Your action |
|------|----------------|------------|
| Unique title per page | Yes | — |
| Meta description per page | Yes | — |
| Canonical URLs | Yes | — |
| Schema.org (Organization + LocalBusiness) | Yes (homepage) | — |
| Sitemap with all key pages | Yes | Submit in GSC & Bing |
| robots.txt allows crawling | Yes | — |
| Submit sitemap to Google | — | Do in Search Console |
| Submit sitemap to Bing | — | Do in Bing Webmaster |
| HTTPS live | — | Enable SSL, then uncomment .htaccess |
| Google Business (Port Louis) | — | Create/claim and complete profile |

---

## Summary

The site is set up so search engines can **discover, index, and understand** Super Distribution as a Mauritius-wide business. To move toward **#1 in Mauritius and strong international visibility**:

1. Submit `sitemap.xml` in **Google Search Console** and **Bing Webmaster Tools**.
2. Turn on **HTTPS** and (if needed) the redirect in `.htaccess`.
3. Create/optimise **Google Business Profile** for Port Louis, Mauritius.
4. Keep content clear and keyword-rich (Mauritius, island-wide, UJALA, MARGO, Super Bio) and update the sitemap when you add or change important pages.

Ranking #1 depends on both technical SEO (which is in place) and ongoing visibility work (Search Console, Business Profile, and content).
