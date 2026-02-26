const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let c = fs.readFileSync(htmlPath, 'utf8');

const startMark = '  <!-- ========== SOCIAL FEED ==========';
const endMark   = '  <!-- ========== CTA BANNER';

const startIdx = c.indexOf(startMark);
const endIdx   = c.indexOf(endMark);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find section boundaries');
  process.exit(1);
}

const igIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`;

const fbIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

const newSection = `  <!-- ========== SOCIAL FEED ========== -->
  <section class="social-feed-section">
    <div class="social-feed-section-inner">
      <div class="sfs-header">
        <span class="sfs-tag">Social</span>
        <h2 class="sfs-title">Follow Our <em>Journey</em></h2>
        <p class="sfs-sub">Stay connected — behind the scenes, product drops and updates across our socials.</p>
        <div class="sfs-platform-pills">
          <a href="https://www.facebook.com/superdistributionltd" target="_blank" rel="noopener" class="sfs-pill sfs-pill-fb">
            ${fbIcon} 3.6K Followers
          </a>
          <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="sfs-pill sfs-pill-ig">
            ${igIcon} @superdistribution
          </a>
        </div>
      </div>

      <div class="social-feed-grid">

        <!-- FACEBOOK live Page Plugin -->
        <div class="social-col social-col-fb">
          <div class="social-col-header">
            <div class="social-col-platform">
              <div class="social-platform-icon fb">${fbIcon}</div>
              <div>
                <strong>Super Distribution Ltd.</strong>
                <span>@superdistributionltd &nbsp;&middot;&nbsp; 3.6K followers</span>
              </div>
            </div>
            <a href="https://www.facebook.com/superdistributionltd" target="_blank" rel="noopener noreferrer" class="social-follow-btn fb">Follow</a>
          </div>
          <div class="social-live-badge"><span class="live-dot"></span>Live Feed</div>
          <div class="social-col-embed">
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fsuperdistributionltd&tabs=timeline&width=500&height=560&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true"
              width="100%" height="560"
              style="border:none;overflow:hidden;display:block;"
              scrolling="no" frameborder="0" allowfullscreen="true"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              loading="lazy" title="Super Distribution Facebook Page">
            </iframe>
          </div>
          <a href="https://www.facebook.com/superdistributionltd" target="_blank" rel="noopener noreferrer" class="social-view-all-btn fb-btn">
            ${fbIcon} View all posts on Facebook
          </a>
        </div>

        <!-- INSTAGRAM enhanced -->
        <div class="social-col social-col-ig">
          <div class="social-col-header">
            <div class="social-col-platform">
              <div class="social-platform-icon ig">${igIcon}</div>
              <div>
                <strong>Super Distribution</strong>
                <span>@superdistribution &nbsp;&middot;&nbsp; Instagram</span>
              </div>
            </div>
            <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener noreferrer" class="social-follow-btn ig">Follow</a>
          </div>
          <div class="social-live-badge ig-live-badge"><span class="live-dot ig-dot"></span>Live Feed</div>
          <div class="ig-feed-wrap">
            <div class="ig-fallback-grid">
              <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="igf-tile" style="background:linear-gradient(135deg,#fef9ee,#fde68a)">
                <img src="assets/images/brands/Ujala.png" alt="UJALA" loading="lazy">
                <div class="igf-overlay"><span>&#9829; View</span></div>
              </a>
              <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="igf-tile" style="background:linear-gradient(135deg,#fee2e2,#fca5a5)">
                <img src="assets/images/brands/Margo.png" alt="MARGO" loading="lazy">
                <div class="igf-overlay"><span>&#9829; View</span></div>
              </a>
              <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="igf-tile" style="background:linear-gradient(135deg,#ecfdf5,#6ee7b7)">
                <img src="assets/images/brands/Super_Bio.png" alt="Super Bio" loading="lazy">
                <div class="igf-overlay"><span>&#9829; View</span></div>
              </a>
              <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="igf-tile" style="background:linear-gradient(135deg,#eff6ff,#93c5fd)">
                <img src="assets/images/brands/Maya.png" alt="Maya" loading="lazy">
                <div class="igf-overlay"><span>&#9829; View</span></div>
              </a>
              <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="igf-tile" style="background:linear-gradient(135deg,#fdf4ff,#d8b4fe)">
                <img src="assets/images/brands/Neem.png" alt="Neem" loading="lazy">
                <div class="igf-overlay"><span>&#9829; View</span></div>
              </a>
              <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener" class="igf-tile" style="background:linear-gradient(135deg,#fff7ed,#fdba74)">
                <img src="assets/images/brands/Super_Manufacturing.png" alt="Super Mfg." loading="lazy">
                <div class="igf-overlay"><span>&#9829; View</span></div>
              </a>
            </div>
          </div>
          <a href="https://www.instagram.com/superdistribution/" target="_blank" rel="noopener noreferrer" class="social-view-all-btn ig-btn">
            ${igIcon} View all posts on Instagram
          </a>
        </div>

      </div>
    </div>
  </section>

`;

const newContent = c.substring(0, startIdx) + newSection + c.substring(endIdx);
fs.writeFileSync(htmlPath, newContent, 'utf8');
console.log('Social section updated successfully.');
console.log('sfs-header found:', newContent.indexOf('sfs-header'));
console.log('social-live-badge found:', newContent.indexOf('social-live-badge'));
