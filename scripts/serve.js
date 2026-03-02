#!/usr/bin/env node
/**
 * serve.js – Local dev server with clean-URL support
 * Serves the project so /about, /contact, /products-innerpage/product-maya-incense etc. work
 * (rewrites to .html). Fixes "Cannot GET /about" when using a simple static server.
 *
 * Run from project root: node scripts/serve.js
 * Then open http://127.0.0.1:3000/about (or the port shown).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

function listHtmlFiles() {
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

function pathToFile(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const clean = (decoded === '/' || decoded === '' || decoded === '/index') ? '/index.html' : decoded;
  const noLeading = clean.replace(/^\//, '');
  const withHtml = noLeading.endsWith('.html') ? noLeading : noLeading + '.html';
  const filePath = path.join(ROOT, path.normalize(withHtml).replace(/^(\.\.(\/|\\))+/, ''));
  return filePath;
}

function resolveRequest(urlPath) {
  const normalized = urlPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const asFile = path.join(ROOT, path.normalize(normalized.replace(/^\//, '')).replace(/^(\.\.(\/|\\))+/, ''));
  if (fs.existsSync(asFile)) {
    const stat = fs.statSync(asFile);
    if (stat.isFile()) return asFile;
    if (stat.isDirectory()) {
      const index = path.join(asFile, 'index.html');
      if (fs.existsSync(index)) return index;
    }
  }
  const asHtml = pathToFile(normalized);
  if (fs.existsSync(asHtml) && fs.statSync(asHtml).isFile()) return asHtml;
  const fallback404 = path.join(ROOT, '404.html');
  return fs.existsSync(fallback404) ? fallback404 : null;
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0].split('#')[0];
  const filePath = resolveRequest(urlPath);
  if (!filePath || !fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log('Super Distribution – local server with clean URLs');
  console.log('  http://127.0.0.1:' + PORT + '/');
  console.log('  http://localhost:' + PORT + '/about');
  console.log('  (Stop with Ctrl+C)\n');
});
