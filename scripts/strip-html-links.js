#!/usr/bin/env node
/**
 * strip-html-links.js – Super Distribution
 * 1. Ensures .htaccess has rules to redirect .html → clean URL and serve clean URL as .html
 * 2. Replaces all internal links that point to .html with clean URLs (so the browser never shows .html)
 * Run from project root: node scripts/strip-html-links.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTACCESS_PATH = path.join(ROOT, '.htaccess');

const HTACCESS_REDIRECT_MARK = 'Redirect .html -> no extension';
const HTACCESS_REWRITE_MARK = 'Serve .html when URL has no extension';

function toCleanHref(htmlPath) {
  const withoutExt = htmlPath.replace(/\.html$/i, '');
  const base = withoutExt.replace(/^(\.\.\/)+/, '').trim();
  if (base === 'index' || base === '') return '/';
  return '/' + base;
}

function ensureHtaccess() {
  if (!fs.existsSync(HTACCESS_PATH)) {
    console.log('Warning: .htaccess not found. Create it for clean URLs on Apache/Hostinger.');
    return false;
  }
  let content = fs.readFileSync(HTACCESS_PATH, 'utf8');
  let changed = false;

  // Ensure redirect rule exists (301 .html -> no extension)
  if (!content.includes('THE_REQUEST') || !content.includes('.html')) {
    const redirectBlock = `
  # Remove .html from browser: redirect /page.html -> /page (301)
  RewriteCond %{THE_REQUEST} \\s/+(.+?)\\.html[\\s?] [NC]
  RewriteRule ^ /%1 [R=301,L,NE]
`;
    if (!content.includes('RewriteRule ^ /%1')) {
      content = content.replace(/(RewriteBase \/)\s*\n/, '$1\n' + redirectBlock + '\n');
      changed = true;
    }
  }

  // Ensure rewrite rule exists (serve /page as page.html)
  if (!content.includes('REQUEST_FILENAME}.html -f') || !content.includes('$1.html')) {
    const rewriteBlock = `
  # Serve .html when URL has no extension: /page or /products-innerpage/name -> .html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.+)$ $1.html [L]
`;
    if (!content.includes('RewriteRule ^(.+)$ $1.html')) {
      content = content.replace(/(# Remove .html from browser[\s\S]*?RewriteRule ^ \/%1 \[R=301,L,NE\])\s*\n/, '$1\n' + rewriteBlock);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(HTACCESS_PATH, content, 'utf8');
    console.log('Updated .htaccess with redirect/rewrite rules for .html.');
  } else {
    console.log('.htaccess already has redirect and rewrite rules for .html.');
  }
  return true;
}

function stripHtmlFromLinks(htmlContent) {
  // Match internal links: href="...something.html" or href="../...something.html"
  // Do not match http(s):, //, javascript:, mailto:, tel:, or # only
  return htmlContent.replace(
    /href="((?!(?:https?:|\/\/|javascript:|mailto:|tel:))[^"]*?)\.html([^"]*)"/gi,
    (_, pathPart, rest) => {
      const clean = toCleanHref(pathPart + '.html');
      const suffix = rest || '';
      return `href="${clean}${suffix}"`;
    }
  );
}

function processHtmlFiles() {
  const files = [];
  function scan(dir, base = '') {
    const full = path.join(dir, base);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) {
        scan(dir, base ? base + '/' + name : name);
      }
    } else if (stat.isFile() && base.endsWith('.html')) {
      files.push(base.replace(/\\/g, '/'));
    }
  }
  scan(ROOT, '');
  return files;
}

function run() {
  console.log('Super Distribution – strip .html from internal links\n');

  ensureHtaccess();

  const htmlFiles = processHtmlFiles();
  let totalReplacements = 0;

  for (const rel of htmlFiles) {
    const filePath = path.join(ROOT, rel);
    let content = fs.readFileSync(filePath, 'utf8');
    const before = (content.match(/href="[^"]*\.html[^"]*"/gi) || []).length;
    const newContent = stripHtmlFromLinks(content);
    const after = (newContent.match(/href="[^"]*\.html[^"]*"/gi) || []).length;
    const replaced = before - after;
    if (replaced > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      totalReplacements += replaced;
      console.log('  ' + rel + ': ' + replaced + ' link(s) updated');
    }
  }

  console.log('\nDone. Total internal .html links converted to clean URLs: ' + totalReplacements + '.');
  console.log('Re-run after adding new pages if needed.');
}

run();
