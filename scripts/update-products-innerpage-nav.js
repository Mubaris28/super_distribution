/**
 * update-products-innerpage-nav.js
 * Updates navbar (logo + Products dropdown) and mobile menu on every HTML page
 * in products-innerpage/ so they match the main site and use correct relative paths.
 *
 * Run from project root: node scripts/update-products-innerpage-nav.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INNERPAGE_DIR = path.join(ROOT, 'products-innerpage');
const PREFIX = '../'; // relative from products-innerpage/ to root

// Navbar: logo + full nav links with Products dropdown (all links use PREFIX)
const NAVBAR_HTML = `  <header id="header">
    <div class="nav-promo-bar">
      <span>🏠 Mauritius's Trusted Household Goods Distributor &nbsp;|&nbsp; 🚚 Fast Dispatch &nbsp;|&nbsp; 📦 Wholesale
        &amp; Retail &nbsp;|&nbsp; ⭐ 4.9 Star Rated</span>
    </div>
    <nav class="navbar">
      <a href="${PREFIX}index.html" class="nav-logo">
        <img src="${PREFIX}assets/images/logo/SD_LOGO-01.png" alt="Super Distribution" class="nav-logo-img">
      </a>
      <ul class="nav-links" id="navLinks">
        <li><a href="${PREFIX}index.html" class="nav-link">Home</a></li>
        <li><a href="${PREFIX}about.html" class="nav-link">About</a></li>
        <li><a href="${PREFIX}clients.html" class="nav-link">Our Clients</a></li>
        <li class="has-dropdown" id="productsDropdown">
          <a href="${PREFIX}products.html" class="nav-link">Products <svg class="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>
          <ul class="nav-dropdown">
            <li><a href="${PREFIX}household.html">Household</a></li>
            <li><a href="${PREFIX}compostable.html">Compostable</a></li>
            <li><a href="${PREFIX}cosmetic.html">Cosmetic</a></li>
            <li><a href="${PREFIX}religious.html">Religious</a></li>
            <li><a href="${PREFIX}stationary.html">Stationery</a></li>
          </ul>
        </li>
        <li><a href="${PREFIX}career.html" class="nav-link">Careers</a></li>
        <li><a href="${PREFIX}contact.html" class="nav-link nav-link-cta">Contact Us</a></li>
      </ul>
      <div class="nav-actions">
        <button class="icon-btn search-btn" aria-label="Search">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" type="button">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  </header>`;

// Mobile menu with Products dropdown (expandable)
const MOBILE_MENU_HTML = `  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <button class="mobile-menu-close" id="menuClose" type="button" aria-label="Close menu">✕</button>
    <ul class="mobile-menu-list">
      <li><a href="${PREFIX}index.html" class="mm-link">Home</a></li>
      <li><a href="${PREFIX}about.html" class="mm-link">About</a></li>
      <li><a href="${PREFIX}clients.html" class="mm-link">Our Clients</a></li>
      <li class="mm-has-sub">
        <a href="${PREFIX}products.html" class="mm-parent mm-link">Products <span class="mm-chevron" aria-hidden="true">▼</span></a>
        <ul class="mm-sub">
          <li><a href="${PREFIX}household.html" class="mm-link">Household</a></li>
          <li><a href="${PREFIX}compostable.html" class="mm-link">Compostable</a></li>
          <li><a href="${PREFIX}cosmetic.html" class="mm-link">Cosmetic</a></li>
          <li><a href="${PREFIX}religious.html" class="mm-link">Religious</a></li>
          <li><a href="${PREFIX}stationary.html" class="mm-link">Stationery</a></li>
        </ul>
      </li>
      <li><a href="${PREFIX}career.html" class="mm-link">Careers</a></li>
      <li><a href="${PREFIX}contact.html" class="mm-link">Contact Us</a></li>
    </ul>
  </div>
  <div class="mobile-menu-overlay" id="menuOverlay" aria-hidden="true"></div>`;

// Page loader + inline fallback so the overlay never blocks the page if main.js fails to load
const LOADER_WITH_FALLBACK = `  <div id="pageLoader" class="page-loader" aria-hidden="true">
    <div class="page-loader-inner">
      <div class="page-loader-spinner"></div>
      <p class="page-loader-text">Loading</p>
    </div>
  </div>
  <script>(function(){var l=document.getElementById('pageLoader');if(!l)return;function h(){if(l.classList.contains('loaded'))return;l.classList.add('loaded');setTimeout(function(){l.remove();},400);}if(document.readyState!=='loading')setTimeout(h,450);else document.addEventListener('DOMContentLoaded',function(){setTimeout(h,450);});setTimeout(h,2500);})();<\/script>`;

function updateFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 0) Ensure loader has fallback so it never blocks the page (main.js may load late or fail)
  const loaderBlockRegex = /  <div id="pageLoader" class="page-loader"[^>]*>\s*\n\s*<div class="page-loader-inner">[\s\S]*?  <\/div>\s*\n  <\/div>\s*\n(?!  <script>\(function\(\)\{var l=document\.getElementById\('pageLoader'\))/;
  if (loaderBlockRegex.test(html)) {
    html = html.replace(loaderBlockRegex, LOADER_WITH_FALLBACK + '\n');
  }

  // 1) Replace entire <header id="header"> ... </header> with our navbar
  const headerRegex = /  <header id="header">[\s\S]*?  <\/header>/;
  if (!headerRegex.test(html)) {
    return { updated: false, reason: 'no header match' };
  }
  html = html.replace(headerRegex, NAVBAR_HTML);

  // 2) Fix any nav/footer logo still pointing to assets/ without ../
  html = html.replace(
    /(<img[^>]*src=")(?!\.\.\/|https?:\/\/)(assets\/images\/logo\/[^"]+")/g,
    '$1' + PREFIX + '$2'
  );

  // 3) Replace mobile menu block: <div class="mobile-menu" ... </div> + overlay <div>
  const mobileMenuRegex = /  <div class="mobile-menu" id="mobileMenu"[^>]*>[\s\S]*?  <\/div>\s*\n  <div class="mobile-menu-overlay" id="menuOverlay"[^>]*><\/div>/;
  if (mobileMenuRegex.test(html)) {
    html = html.replace(mobileMenuRegex, MOBILE_MENU_HTML + '\n');
  }

  // 4) Ensure nav.js is loaded: add after main.js if missing
  if (!/nav\.js/.test(html)) {
    html = html.replace(
      /(<script src="[^"]*main\.js"[^>]*><\/script>)/,
      '$1\n  <script src="' + PREFIX + 'assets/js/nav.js"></script>'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return { updated: true };
}

function main() {
  if (!fs.existsSync(INNERPAGE_DIR)) {
    console.error('Directory not found:', INNERPAGE_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(INNERPAGE_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(INNERPAGE_DIR, f));

  console.log('Updating navbar and mobile menu in products-innerpage/ ...\n');
  let ok = 0;
  let skip = 0;

  for (const filePath of files) {
    const name = path.basename(filePath);
    try {
      const result = updateFile(filePath);
      if (result.updated) {
        console.log('  OK  ', name);
        ok++;
      } else {
        console.log('  skip', name, result.reason || '');
        skip++;
      }
    } catch (err) {
      console.error('  FAIL', name, err.message);
    }
  }

  console.log('\nDone.', ok, 'updated,', skip, 'skipped.');
}

main();
