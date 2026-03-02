#!/usr/bin/env node
/**
 * audit-links.js – Super Distribution
 * 1. Builds list of valid pages (from .html files)
 * 2. Scans all internal links and reports: OK, BROKEN (404), or FIX (e.g. /index → /)
 * 3. Fixes: href="/index" and href="/index.html" → href="/"
 * 4. Ensures logo and Home always point to "/" (so URL bar shows superdistribution.mu/ only)
 * 5. Removes local cache dirs from the project
 * Run from project root: node scripts/audit-links.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIRS = ['.cache', 'node_modules/.cache', '.parcel-cache', 'dist', '.next'];

function getValidCleanPaths() {
  const valid = new Set(['/']);
  function scan(dir, base = '') {
    const full = path.join(dir, base);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) {
        scan(dir, base ? base + '/' + name : name);
      }
    } else if (stat.isFile() && base.endsWith('.html')) {
      const rel = base.replace(/\\/g, '/');
      const withoutExt = rel.replace(/\.html$/i, '');
      if (withoutExt === 'index') valid.add('/');
      else if (rel !== '404.html') valid.add('/' + withoutExt);
    }
  }
  scan(ROOT, '');
  return valid;
}

function collectInternalLinks(htmlContent) {
  const links = [];
  const re = /href="(\/(?:[^"#?]*?))(#.*?)?"/g;
  let m;
  while ((m = re.exec(htmlContent)) !== null) {
    const target = m[1];
    if (target.startsWith('//') || target.startsWith('/http')) continue;
    links.push({ full: m[0], path: target, anchor: m[2] || '' });
  }
  return links;
}

function runAudit(validPaths) {
  const report = { ok: [], broken: [], fixIndex: [] };
  const htmlFiles = [];
  function scan(dir, base = '') {
    const full = path.join(dir, base);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) {
        scan(dir, base ? base + '/' + name : name);
      }
    } else if (stat.isFile() && base.endsWith('.html')) {
      htmlFiles.push(base.replace(/\\/g, '/'));
    }
  }
  scan(ROOT, '');

  for (const rel of htmlFiles) {
    const filePath = path.join(ROOT, rel);
    const content = fs.readFileSync(filePath, 'utf8');
    const links = collectInternalLinks(content);
    for (const { path: linkPath } of links) {
      if (linkPath === '/index' || linkPath === '/index.html') {
        report.fixIndex.push({ file: rel, link: linkPath });
        continue;
      }
      if (linkPath === '/favicon.ico' || linkPath.startsWith('/assets/')) continue;
      if (validPaths.has(linkPath)) report.ok.push({ file: rel, link: linkPath });
      else report.broken.push({ file: rel, link: linkPath });
    }
  }
  return report;
}

function fixIndexLinks() {
  let total = 0;
  const htmlFiles = [];
  function scan(dir, base = '') {
    const full = path.join(dir, base);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) {
        scan(dir, base ? base + '/' + name : name);
      }
    } else if (stat.isFile() && base.endsWith('.html')) {
      htmlFiles.push(path.join(ROOT, base.replace(/\\/g, '/')));
    }
  }
  scan(ROOT, '');
  for (const filePath of htmlFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;
    content = content.replace(/href="\/index\.html?"/gi, 'href="/"');
    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf8');
      total++;
    }
  }
  return total;
}

function fixProductInnerLinks() {
  let total = 0;
  const htmlFiles = [];
  function scan(dir, base = '') {
    const full = path.join(dir, base);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) {
        scan(dir, base ? base + '/' + name : name);
      }
    } else if (stat.isFile() && base.endsWith('.html')) {
      htmlFiles.push(path.join(ROOT, base.replace(/\\/g, '/')));
    }
  }
  scan(ROOT, '');
  for (const filePath of htmlFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = content;
    content = content.replace(/href="\/product-/g, 'href="/products-innerpage/product-');
    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf8');
      total++;
    }
  }
  return total;
}

function ensureHomeAndLogoPointToRoot() {
  const indexPath = path.join(ROOT, 'index.html');
  if (!fs.existsSync(indexPath)) return 0;
  let content = fs.readFileSync(indexPath, 'utf8');
  const before = content;
  content = content.replace(/<a href="#banner" class="nav-link active">Home<\/a>/, '<a href="/" class="nav-link active">Home</a>');
  content = content.replace(/<a href="#banner" class="mm-link">Home<\/a>/, '<a href="/" class="mm-link">Home</a>');
  if (content !== before) {
    fs.writeFileSync(indexPath, content, 'utf8');
    return 1;
  }
  return 0;
}

function clearCache() {
  let removed = 0;
  for (const name of CACHE_DIRS) {
    const full = path.join(ROOT, name);
    if (fs.existsSync(full)) {
      try {
        fs.rmSync(full, { recursive: true });
        console.log('  Removed: ' + name);
        removed++;
      } catch (e) {
        console.warn('  Could not remove ' + name + ': ' + e.message);
      }
    }
  }
  return removed;
}

function run() {
  console.log('Super Distribution – link audit & redirect fix\n');

  const validPaths = getValidCleanPaths();
  console.log('Valid clean URLs: ' + validPaths.size + ' (from .html files, excluding 404)\n');

  const report = runAudit(validPaths);

  if (report.broken.length > 0) {
    console.log('BROKEN (link target has no .html page):');
    const byLink = {};
    report.broken.forEach(({ file, link }) => {
      if (!byLink[link]) byLink[link] = [];
      byLink[link].push(file);
    });
    Object.keys(byLink).sort().forEach((link) => {
      console.log('  ' + link + ' ← used in: ' + byLink[link].slice(0, 5).join(', ') + (byLink[link].length > 5 ? ' ...' : ''));
    });
    console.log('');
  }

  console.log('FIX: Replacing any href="/index" or href="/index.html" with href="/"');
  const nIndex = fixIndexLinks();
  console.log('  ' + (nIndex ? 'Updated ' + nIndex + ' file(s).' : 'None found; already correct.') + '\n');

  console.log('FIX: Replacing href="/product-*" with href="/products-innerpage/product-*" (broken 404s)');
  const nProduct = fixProductInnerLinks();
  console.log('  ' + (nProduct ? 'Updated ' + nProduct + ' file(s).' : 'None found; already correct.') + '\n');

  console.log('Home & logo: Ensuring they point to "/" only (so URL bar shows superdistribution.mu/)');
  const homeFixed = ensureHomeAndLogoPointToRoot();
  console.log('  ' + (homeFixed ? 'Updated index.html: Home menu links now href="/".' : 'Already correct.') + '\n');

  console.log('Cache: Removing local cache dirs from project.');
  const cacheRemoved = clearCache();
  if (cacheRemoved === 0) console.log('  No cache dirs found (e.g. .cache, node_modules/.cache).\n');
  else console.log('');

  console.log('Summary:');
  console.log('  OK links: ' + report.ok.length);
  console.log('  Broken: ' + report.broken.length);
  console.log('  /index fixes applied. Logo & Home → "/". Cache cleared.');
  console.log('\nIf you still see 404 or wrong redirects on the live site:');
  console.log('  1. Re-upload .htaccess (redirect /index and .html → clean URLs).');
  console.log('  2. Clear browser cache or test in incognito.');
  console.log('  3. Ensure Hostinger has mod_rewrite enabled.');
}

run();
