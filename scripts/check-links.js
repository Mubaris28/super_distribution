#!/usr/bin/env node
/**
 * check-links.js – Check all internal links across the project
 * Verifies every href="/..." in HTML files resolves to a valid page (file or clean URL).
 * Run from project root: node scripts/check-links.js
 * Exit code: 0 if all OK, 1 if any broken links.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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
    links.push({ path: target, anchor: m[2] || '' });
  }
  return links;
}

function getAllHtmlFiles() {
  const out = [];
  function scan(dir, base = '') {
    const full = path.join(dir, base);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) {
        scan(dir, base ? base + '/' + name : name);
      }
    } else if (stat.isFile() && base.endsWith('.html')) {
      out.push(base.replace(/\\/g, '/'));
    }
  }
  scan(ROOT, '');
  return out;
}

function main() {
  const validPaths = getValidCleanPaths();
  const htmlFiles = getAllHtmlFiles();
  const broken = [];
  const ok = [];

  for (const rel of htmlFiles) {
    const filePath = path.join(ROOT, rel);
    const content = fs.readFileSync(filePath, 'utf8');
    const links = collectInternalLinks(content);
    for (const { path: linkPath } of links) {
      if (linkPath === '/index' || linkPath === '/index.html') {
        broken.push({ file: rel, link: linkPath, hint: 'Use href="/" instead' });
        continue;
      }
      if (linkPath === '/favicon.ico' || linkPath.startsWith('/assets/')) {
        ok.push({ file: rel, link: linkPath });
        continue;
      }
      if (validPaths.has(linkPath)) {
        ok.push({ file: rel, link: linkPath });
      } else {
        broken.push({ file: rel, link: linkPath });
      }
    }
  }

  console.log('Link check across', htmlFiles.length, 'HTML files\n');
  if (broken.length) {
    console.log('BROKEN (would 404 without clean-URL server):');
    const byLink = new Map();
    for (const { file, link, hint } of broken) {
      const key = link;
      if (!byLink.has(key)) byLink.set(key, []);
      byLink.get(key).push({ file, hint });
    }
    for (const [link, refs] of byLink) {
      console.log('  ', link);
      for (const { file, hint } of refs) console.log('      in', file, hint ? '– ' + hint : '');
    }
    console.log('\nTotal broken references:', broken.length);
    process.exit(1);
  }
  console.log('All internal links OK.');
  process.exit(0);
}

main();
