/**
 * Sync all page footers to match the home page (index.html).
 * - Root-level pages get the exact footer from index.html.
 * - Pages in products-innerpage/ get the same footer with paths adjusted (../ for assets and root links).
 *
 * Run from project root: node scripts/sync-footers.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(PROJECT_ROOT, 'index.html');

const FOOTER_START_MARKER = '  <!-- ========== FOOTER ========== -->';
const FOOTER_TAG_START = '<footer';
const FOOTER_TAG_END = '</footer>';

/** Extract footer HTML from index.html (from comment or <footer to </footer>) */
function extractCanonicalFooter() {
  const content = fs.readFileSync(INDEX_PATH, 'utf8');
  let start = content.indexOf(FOOTER_START_MARKER);
  if (start === -1) start = content.indexOf(FOOTER_TAG_START);
  if (start === -1) throw new Error('Could not find footer start in index.html');

  const endIdx = content.indexOf(FOOTER_TAG_END, start);
  if (endIdx === -1) throw new Error('Could not find footer end in index.html');
  const end = endIdx + FOOTER_TAG_END.length;

  return content.slice(start, end);
}

/** Convert root-relative footer to products-innerpage-relative (add ../ for root links and assets) */
function toInnerFooter(rootFooter) {
  return rootFooter
    .replace(/\bhref="index\.html"/g, 'href="../index.html"')
    .replace(/\bhref="about\.html"/g, 'href="../about.html"')
    .replace(/\bhref="contact\.html"/g, 'href="../contact.html"')
    .replace(/\bhref="products\.html"/g, 'href="../products.html"')
    .replace(/\bhref="reseller-application\.html"/g, 'href="../reseller-application.html"')
    .replace(/\bhref="privacy-policy\.html"/g, 'href="../privacy-policy.html"')
    .replace(/\bhref="compostable\.html"/g, 'href="../compostable.html"')
    .replace(/\bhref="household\.html"/g, 'href="../household.html"')
    .replace(/\bhref="stationary\.html"/g, 'href="../stationary.html"')
    .replace(/\bhref="religious\.html"/g, 'href="../religious.html"')
    .replace(/\bhref="cosmetic\.html"/g, 'href="../cosmetic.html"')
    .replace(/\bhref="products-innerpage\//g, 'href="')
    .replace(/\bsrc="assets\//g, 'src="../assets/');
}

/** Find footer block in content (start index and end index). Returns [start, end] or null. */
function findFooterBlock(content) {
  let start = content.indexOf(FOOTER_START_MARKER);
  if (start === -1) start = content.indexOf(FOOTER_TAG_START);
  if (start === -1) return null;

  const endIdx = content.indexOf(FOOTER_TAG_END, start);
  if (endIdx === -1) return null;
  const end = endIdx + FOOTER_TAG_END.length;
  return [start, end];
}

/** Replace footer in content with newFooter. Returns { content, replaced: true } or { content, replaced: false } if inserted. */
function replaceOrInsertFooter(content, newFooter) {
  const block = findFooterBlock(content);
  if (block) {
    const [start, end] = block;
    return { content: content.slice(0, start) + newFooter + content.slice(end), replaced: true };
  }
  // No footer found: insert before </body>
  const bodyClose = content.lastIndexOf('</body>');
  if (bodyClose === -1) return null;
  const insert = '\n\n  ' + newFooter + '\n\n  ';
  return { content: content.slice(0, bodyClose) + insert + content.slice(bodyClose), replaced: false };
}

/** List all HTML files that should have the footer (exclude index.html as source). */
function listHtmlFiles() {
  const files = [];
  const rootFiles = fs.readdirSync(PROJECT_ROOT).filter((f) => f.endsWith('.html') && f !== 'index.html');
  rootFiles.forEach((f) => files.push({ path: path.join(PROJECT_ROOT, f), relative: f, inner: false }));

  const innerDir = path.join(PROJECT_ROOT, 'products-innerpage');
  if (fs.existsSync(innerDir)) {
    fs.readdirSync(innerDir)
      .filter((f) => f.endsWith('.html'))
      .forEach((f) => files.push({ path: path.join(innerDir, f), relative: `products-innerpage/${f}`, inner: true }));
  }

  return files;
}

function main() {
  console.log('Reading canonical footer from index.html...');
  const rootFooter = extractCanonicalFooter();
  const innerFooter = toInnerFooter(rootFooter);

  const files = listHtmlFiles();
  console.log(`Found ${files.length} pages to check (excluding index.html).\n`);

  let updated = 0;
  let skipped = 0;
  let inserted = 0;

  for (const { path: filePath, relative, inner } of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const newFooter = inner ? innerFooter : rootFooter;
    const result = replaceOrInsertFooter(content, newFooter);

    if (result === null) {
      console.log(`Skip (no </body>): ${relative}`);
      skipped++;
      continue;
    }

    if (result.content !== content) {
      fs.writeFileSync(filePath, result.content);
      if (result.replaced) {
        console.log(`Updated: ${relative}`);
      } else {
        console.log(`Inserted footer: ${relative}`);
        inserted++;
      }
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone. Updated: ${updated} (${inserted} inserted where missing), unchanged: ${skipped}`);
}

main();
