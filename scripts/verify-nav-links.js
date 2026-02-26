/**
 * verify-nav-links.js
 * Ensures all HTML pages have the same navbar links as index.html.
 * Run after sync-nav.js. Usage: node scripts/verify-nav-links.js
 *
 * Expected nav links (from index.html):
 *   Home (index or #banner), About, Our Clients, Products + dropdown,
 *   Careers, Contact Us
 */
const fs = require('fs');
const path = require('path');

// Key links that must appear in every page's nav (as substring of href)
const requiredLinks = ['products.html', 'about.html', 'clients.html', 'career.html', 'contact.html', 'index.html'];
console.log('Required nav links:', requiredLinks.join(', '));

function findPages() {
  const rootDir = path.join(__dirname, '..');
  const root = fs.readdirSync(rootDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html');
  const inner = fs.existsSync(path.join(rootDir, 'products-innerpage'))
    ? fs.readdirSync(path.join(rootDir, 'products-innerpage'))
        .filter(f => f.endsWith('.html'))
        .map(f => 'products-innerpage/' + f)
    : [];
  return [...root, ...inner];
}

const pages = findPages();
let failed = 0;

pages.forEach(relPath => {
  const filePath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const headerStart = content.indexOf('<header id="header">');
  const headerEnd = content.indexOf('</header>', headerStart) + '</header>'.length;
  if (headerStart === -1 || headerEnd === -1) {
    console.log('  SKIP (no header):', relPath);
    return;
  }
  const header = content.slice(headerStart, headerEnd);
  const missing = requiredLinks.filter(link => !header.includes(link));
  if (missing.length > 0) {
    console.log('  MISSING in', relPath + ':', missing.join(', '));
    failed++;
  }
});

if (failed === 0) {
  console.log('\nAll', pages.length, 'pages have correct nav links.');
} else {
  console.log('\n' + failed, 'page(s) with missing links. Run: node scripts/sync-nav.js');
  process.exit(1);
}
