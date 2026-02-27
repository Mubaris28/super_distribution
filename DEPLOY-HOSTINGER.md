# Deploy to Hostinger – Checklist

## Upload to `public_html`

Upload the **contents** of the project (not the project folder itself) into Hostinger’s **public_html** (or the domain’s document root).

---

## Do **not** upload (exclude these)

| Exclude | Why |
|--------|-----|
| **`.git`** | Version control; not needed on server, avoids exposing repo |
| **`node_modules`** | If present: dependencies; not used by the live site |
| **`vendor/`** | Only upload if you use PHP mail (contact/reseller forms); otherwise omit |
| **`.cursor`** / **`.vscode`** | If present: editor config; not needed on server |
| **`README.md`**, **`DEPLOY-HOSTINGER.md`** | Optional to exclude (docs only) |

*Dev-only files (scripts/, docs/, SEO-GUIDE, AUDIT-REPORT, etc.) have been removed from the project.*

---

## Before / after upload

1. **SSL (HTTPS)**  
   In Hostinger, enable **SSL** for the domain.  
   `.htaccess` is set to **force HTTPS**. If SSL is not active yet, comment out the HTTPS block in `.htaccess` to avoid redirect loops.

2. **PHP config (if using contact/reseller forms)**  
   - Upload `assets/php/` and ensure `mail-config.php` and `security-config.php` use your real email/settings.  
   - `.htaccess` already blocks direct access to those config files.

3. **Sitemap**  
   - `sitemap.xml` is in the root; submit `https://yourdomain.com/sitemap.xml` in **Google Search Console** and **Bing Webmaster Tools**.

4. **robots.txt**  
   - Already allows crawlers and points to the sitemap. No change needed unless your domain differs.

5. **Favicon**  
   - Favicons are in **`assets/images/favicon/`**: 16px, 32px, 48px, and 180px (apple-touch) PNGs.  
   - All main HTML pages already include `<link rel="icon">` and `<link rel="apple-touch-icon">` pointing to these files.  
   - `.htaccess` serves the 32px PNG for requests to **`/favicon.ico`** (so no `favicon.ico` file is needed in the root).  
   - **Upload the whole `assets/` folder** so the favicon paths work.

---

## What was updated for Hostinger

- **sitemap.xml** – Added `clients.html`, `career.html`, `career-job-salesman.html`, `career-job-driver.html`; added `lastmod` where missing.
- **.htaccess** – HTTPS redirect (comment out until SSL is on); note about site root; **favicon.ico** → 32px PNG.
