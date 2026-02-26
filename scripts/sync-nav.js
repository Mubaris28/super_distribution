/**
 * sync-nav.js
 * Sync the <header id="header">…</header> block from index.html to all other pages.
 * For each page, removes all `active` classes from nav links, then re-applies them
 * based on the filename mapping below.
 * Run from project root: node scripts/sync-nav.js
 */
const fs = require('fs');
const path = require('path');

// --- Page → which nav href should be "active" ---
// Key = relative file path (from project root), Value = href that should get `active`
const ACTIVE_MAP = {
  'about.html':               'about.html',
  'clients.html':             'clients.html',
  'career.html':              'career.html',
  'products.html':            'products.html',
  'compostable.html':         'compostable.html',
  'household.html':           'household.html',
  'stationary.html':          'stationary.html',
  'religious.html':           'religious.html',
  'cosmetic.html':            'cosmetic.html',
  'contact.html':             'contact.html',
  'reseller-application.html':  'contact.html',
  'career-job-salesman.html':   'career.html',
  'career-job-driver.html':     'career.html',
  'privacy-policy.html':        null,
  '404.html':                   null,
};

// --- Products-innerpage always marks products.html as active ---
const PRODUCTS_INNERPAGE_ACTIVE = 'products.html';

// --- Extract canonical header from index.html ---
const indexContent = fs.readFileSync('index.html', 'utf8');
const headerStart = indexContent.indexOf('<header id="header">');
const headerEnd   = indexContent.indexOf('</header>', headerStart) + '</header>'.length;
if (headerStart === -1 || headerEnd === -1) { console.error('Could not find header in index.html'); process.exit(1); }
const canonicalHeader = indexContent.slice(headerStart, headerEnd);

/** Strip all active classes from header HTML */
function stripActive(html) {
  return html
    .replace(/\bclass="nav-link active([^"]*)"/g, 'class="nav-link$1"')
    .replace(/\bclass="nav-link active"/g, 'class="nav-link"')
    .replace(/\bhas-dropdown active\b/g, 'has-dropdown')
    .replace(/ active"/g, '"')  // catch remaining active classes
    .replace(/ active /g, ' ');
}

/** Add active class to a link matching hrefTarget (flat nav, no dropdown) */
function addActive(html, hrefTarget) {
  if (!hrefTarget) return html;
  const escaped = hrefTarget.replace('.', '\\.');
  const re = new RegExp('href="' + escaped + '" class="nav-link"', 'g');
  return html.replace(re, 'href="' + hrefTarget + '" class="nav-link active"');
}

/** Find all HTML files to update */
function findPages() {
  const root = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html');
  const inner = fs.existsSync('products-innerpage')
    ? fs.readdirSync('products-innerpage').filter(f => f.endsWith('.html')).map(f => `products-innerpage/${f}`)
    : [];
  return [...root, ...inner];
}

/** Replace header in page content */
function replaceHeader(content, newHeader) {
  const start = content.indexOf('<header id="header">');
  const end   = content.indexOf('</header>', start) + '</header>'.length;
  if (start === -1 || end === -1) return null;
  return content.slice(0, start) + newHeader + content.slice(end);
}

/** Also sync mobile menu */
const mmStart = indexContent.indexOf('<div class="mobile-menu"');
const mmEnd   = indexContent.indexOf('</div>', indexContent.indexOf('<div class="mobile-menu-overlay"')) + '</div>'.length;
const canonicalMobileMenu = mmStart !== -1 && mmEnd !== -1 ? indexContent.slice(mmStart, mmEnd) : null;

function replaceMobileMenu(content, newMM) {
  const start = content.indexOf('<div class="mobile-menu"');
  const end = content.indexOf('</div>', content.indexOf('<div class="mobile-menu-overlay"', start)) + '</div>'.length;
  if (start === -1 || end === -1) return content;
  return content.slice(0, start) + newMM + content.slice(end);
}

const pages = findPages();
let updated = 0, unchanged = 0;
console.log(`Reading canonical header from index.html...`);
console.log(`Found ${pages.length} pages to check.\n`);

pages.forEach(function(relPath) {
  const filePath = path.resolve(relPath);
  if (!fs.existsSync(filePath)) return;
  const original = fs.readFileSync(filePath, 'utf8');

  // Determine prefix for relative paths (products-innerpage needs ../)
  const isInner = relPath.startsWith('products-innerpage/');
  let header = canonicalHeader;
  let mm = canonicalMobileMenu;
  // On non-index pages, Home must link to index.html (not #banner)
  header = header.replace(/href="#banner"/g, 'href="index.html"');
  if (mm) mm = mm.replace(/href="#banner"/g, 'href="index.html"');
  if (isInner) {
    header = header.replace(/href="assets\//g, 'href="../assets/').replace(/href="(?!https?:\/\/|#|\.\.\/)([\w-]+\.html)/g, 'href="../$1');
    if (mm) mm = mm.replace(/href="(?!https?:\/\/|#|\.\.\/)([\w-]+\.html)/g, 'href="../$1');
  }

  // Strip active, then re-apply
  header = stripActive(header);
  const filename = path.basename(relPath);
  let activeHref = ACTIVE_MAP.hasOwnProperty(filename) ? ACTIVE_MAP[filename] : null;
  if (isInner && !ACTIVE_MAP.hasOwnProperty(filename)) activeHref = PRODUCTS_INNERPAGE_ACTIVE;
  if (activeHref) header = addActive(header, activeHref);

  // Replace in file
  let content = replaceHeader(original, header);
  if (!content) { console.log(`  Skipped (no header found): ${relPath}`); return; }
  if (mm) content = replaceMobileMenu(content, mm);

  if (content === original) { unchanged++; return; }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${relPath}`);
  updated++;
});

console.log(`\nDone. Updated: ${updated}, unchanged: ${unchanged}`);
