/**
 * run-sync.js
 * Syncs navbar and footer from index.html to all pages, then verifies nav links.
 * Run from project root: node scripts/run-sync.js
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);

console.log('Running sync-nav.js...\n');
execSync('node scripts/sync-nav.js', { stdio: 'inherit' });

console.log('\nRunning sync-footers.js...\n');
execSync('node scripts/sync-footers.js', { stdio: 'inherit' });

console.log('\nVerifying nav links...\n');
try {
  execSync('node scripts/verify-nav-links.js', { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
