# Scripts

## serve.js (local dev server with clean URLs)

Fixes **"Cannot GET /about"** (and similar) when opening the site locally. Live Server and other static servers don’t rewrite clean URLs, so `/about` fails. This script runs a small Node server that rewrites `/about` → `about.html`, `/contact` → `contact.html`, etc.

**Run from project root:**

```bash
node scripts/serve.js
```

Then open **http://127.0.0.1:3000/** or **http://127.0.0.1:3000/about**. Port can be changed with `PORT=5500 node scripts/serve.js` (or `set PORT=5500` then `node scripts/serve.js` on Windows).

**When to use:** For local testing of navigation and links; use this instead of a plain static server if you want clean URLs to work.

---

## check-links.js

Checks **all internal links** across every HTML file in the project. Reports which links would 404 on a server that doesn’t rewrite clean URLs (and flags `/index` or `/index.html` that should be `/`).

**Run from project root:**

```bash
node scripts/check-links.js
```

Exit code **0** = all links OK; **1** = at least one broken link. No files are modified.

**When to run:** After adding or renaming pages, or when you suspect a broken link anywhere in the site.

---

## to-relative-links.js

Converts internal links from absolute clean URLs (e.g. `href="/about"`) to relative `.html` paths (e.g. `href="about.html"` or `href="../about.html"` from subfolders). Use this so the site works with **Live Server**, **file://**, or any static server that does not rewrite URLs — no more "Cannot GET /about" when clicking nav or footer from the home page.

**Run from project root:**

```bash
node scripts/to-relative-links.js
```

On **production** (Hostinger), `.htaccess` already redirects `/about.html` → `/about`, so the address bar still shows clean URLs. Re-run this script after adding new pages if you want local and production to stay in sync.

**When to run:** After adding new HTML pages (so new links are relative), or when you need links to work under Live Server / simple static hosting.

---

## fix-clean-urls.js

Fixes 500 errors on clean URLs like `/about`, `/contact` by generating host-specific config files.

**Run from project root:**

```bash
node scripts/fix-clean-urls.js
```

**What it does:**

- Writes **`_redirects`** – used by Netlify and Cloudflare Pages (rewrite `/about` → `about.html` with status 200).
- Writes **`vercel.json`** – rewrites for Vercel.
- Writes **`web.config`** – URL rewrite rules for IIS.
- Checks that **`.htaccess`** contains the required Apache rewrite rules for Hostinger.
- Writes **`DEPLOY-CHECKLIST.md`** – host-specific steps to fix the 500.

**When to run:** After adding or renaming any `.html` page, so the new clean URL is included in all configs.

---

## strip-html-links.js

Makes sure internal links never show `.html` in the URL bar: converts `href="stationary.html"` → `href="/stationary"`, etc. Also checks that `.htaccess` has the redirect/rewrite rules for clean URLs.

**Run from project root:**

```bash
node scripts/strip-html-links.js
```

**What it does:**

- Verifies **`.htaccess`** has rules to redirect `/page.html` → `/page` (301) and to serve `/page` as `page.html`. Adds them if missing.
- Scans all **`.html`** files and replaces internal links that point to `.html` with clean URLs (e.g. `/about`, `/stationary`, `/products-innerpage/product-name`). Home links become `/`.

**When to run:** After adding new pages or if you notice any link still opening with `.html` in the address bar.

---

## audit-links.js

Finds broken internal links (404s), fixes wrong paths, and keeps the URL bar showing only `superdistribution.mu/` for the homepage.

**Run from project root:**

```bash
node scripts/audit-links.js
```

**What it does:**

- **Validates links** – Builds the list of valid pages from your `.html` files and reports which links point to missing pages (would 404).
- **Fixes** – Replaces `href="/index"` and `href="/index.html"` with `href="/"`; replaces `href="/product-*"` with `href="/products-innerpage/product-*"` so product links work.
- **Home & logo** – Ensures the logo and “Home” in the navbar use `href="/"` so the address bar never shows `/index`.
- **Cache** – Removes local cache dirs (e.g. `.cache`, `node_modules/.cache`) from the project.

**When to run:** After adding or moving pages, or when you see 404s or wrong redirects. Re-upload `.htaccess` after changes and clear browser cache if the live site still misbehaves.
