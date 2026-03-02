#!/usr/bin/env node
/**
 * to-relative-links.js – Convert internal links from absolute (/about) to relative (about.html)
 * so the site works with Live Server and file:// without URL rewriting.
 * Production .htaccess redirects /page.html → /page so URLs stay clean.
 * Run from project root: node scripts/to-relative-links.js
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

function pathToRelative(linkPath, baseDir) {
  if (linkPath === '/') return baseDir ? '../index.html' : 'index.html';
  if (linkPath.startsWith('/products-innerpage/')) {
    const name = linkPath.slice('/products-innerpage/'.length);
    return baseDir === 'products-innerpage' ? (name + '.html') : ('products-innerpage/' + name + '.html');
  }
  const name = linkPath.slice(1);
  const prefix = baseDir ? '../' : '';
  return prefix + name + '.html';
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

function run() {
  const validPaths = getValidCleanPaths();
  const htmlFiles = getAllHtmlFiles();
  let totalReplacements = 0;

  for (const rel of htmlFiles) {
    const filePath = path.join(ROOT, rel);
    const baseDir = path.dirname(rel).replace(/^\.$/, '');
    let content = fs.readFileSync(filePath, 'utf8');

    // Match href="/path" or href="/path#hash" or href="/path?query" or href="/path?query#hash"
    const re = /href="(\/(?:[^"#?]*?))([#?][^"]*?)?"/g;
    content = content.replace(re, (match, linkPath, suffix = '') => {
      if (linkPath.startsWith('//') || linkPath.startsWith('/http')) return match;
      if (linkPath === '/favicon.ico' || linkPath.startsWith('/assets/')) return match;
      if (!validPaths.has(linkPath)) return match;
      const relative = pathToRelative(linkPath, baseDir);
      totalReplacements++;
      return 'href="' + relative + suffix + '"';
    });

    fs.writeFileSync(filePath, content, 'utf8');
  }

  console.log('Converted', totalReplacements, 'internal links to relative .html paths.');
  console.log('Live Server and file:// will now resolve links correctly.');
}

run();
