/* ============================================
   SUPER DISTRIBUTION — MAIN JS
   GSAP Animations + Static Hero + Interactions
   ============================================ */

'use strict';

/* =========================================
   PAGE LOADER — hide when DOM ready (never block navigation)
   ========================================= */
(function pageLoader() {
  var loader = document.getElementById('pageLoader');
  if (!loader) return;
  var minShow = 350;
  var start = Date.now();
  var hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    var elapsed = Date.now() - start;
    var delay = Math.max(0, minShow - elapsed);
    setTimeout(function() {
      loader.classList.add('loaded');
      setTimeout(function() { loader.remove(); }, 400);
    }, delay);
  }

  // Hide on DOMContentLoaded so page never stays stuck (e.g. Products page)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(hideLoader, 50); });
  } else {
    setTimeout(hideLoader, 50);
  }
})();

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* =========================================
   NAV LOGOS — show text until an image loads, then show logos
   ========================================= */
(function() {
  var navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    var imgs = navLogo.querySelectorAll('.nav-logo-img');
    imgs.forEach(function(img) {
      if (img.complete && img.naturalWidth > 0) navLogo.classList.add('logos-loaded');
      else {
        img.addEventListener('load', function() { navLogo.classList.add('logos-loaded'); });
      }
    });
  }
})();

/* =========================================
   UJALA IMAGES — show image when loaded, fallback to CSS art on error
   ========================================= */
(function() {
  document.querySelectorAll('.banner-product-img, .product-card-img').forEach(function(img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() { img.classList.add('loaded'); });
      img.addEventListener('error', function() { img.classList.add('load-failed'); });
    }
  });
})();

/* =========================================
   HEADER — SCROLL EFFECT (safe after DOM ready, no height flash)
   ========================================= */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  function updateScrolled() {
    const y = window.scrollY;
    if (y > 100) header.classList.add('scrolled');
    else if (y < 55) header.classList.remove('scrolled');
  }
  updateScrolled();
  window.addEventListener('scroll', updateScrolled, { passive: true });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeaderScroll);
} else {
  initHeaderScroll();
}

/* =========================================
   MOBILE MENU
   ========================================= */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose   = document.getElementById('menuClose');

function openMenu() {
  if (!mobileMenu || !menuOverlay || !hamburger) return;
  mobileMenu.classList.add('open');
  menuOverlay.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  gsap.fromTo('.mm-link',
    { x: 30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.15 }
  );
  const spans = hamburger.querySelectorAll('span');
  if (spans.length >= 3) {
    gsap.to(spans[0], { y: 7, rotate: 45, duration: 0.3, ease: 'power2.out' });
    gsap.to(spans[1], { opacity: 0, duration: 0.2 });
    gsap.to(spans[2], { y: -7, rotate: -45, duration: 0.3, ease: 'power2.out' });
  }
}

function closeMenu() {
  if (!mobileMenu || !menuOverlay || !hamburger) return;
  mobileMenu.classList.remove('open');
  menuOverlay.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  const spans = hamburger.querySelectorAll('span');
  if (spans.length >= 3) {
    gsap.to(spans[0], { y: 0, rotate: 0, duration: 0.3, ease: 'power2.out' });
    gsap.to(spans[1], { opacity: 1, duration: 0.2 });
    gsap.to(spans[2], { y: 0, rotate: 0, duration: 0.3, ease: 'power2.out' });
  }
}

if (hamburger)   hamburger.addEventListener('click', openMenu);
if (menuClose)   menuClose.addEventListener('click', closeMenu);
if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
document.querySelectorAll('.mm-link').forEach(link => link.addEventListener('click', function(e) {
  if (e.currentTarget.classList.contains('mm-parent')) return; /* Products: toggle submenu in nav.js, don't close */
  closeMenu();
}));

/* =========================================
   SEARCH OVERLAY (navbar search icon) — all pages
   ========================================= */
(function() {
  const searchBtn = document.querySelector('.search-btn');
  if (!searchBtn) return;

  searchBtn.setAttribute('type', 'button');
  const path = window.location.pathname;
  const isInner = /\/products-innerpage\//.test(path);
  const base = isInner ? '../' : '';
  const productsUrl = base + 'products.html';

  const products = [
    { name: 'SD Banana leaf X 100',               cat: 'Religious Section', img: base + 'assets/images/products/religious-section/banana/banana.png',      href: base + 'products-innerpage/product-religious-banana-leaf-x100.html' },
    { name: 'SD Surgical Mask x 50',              cat: 'Personal care',  img: base + 'assets/images/products/personal-care/mask.png',                        href: base + 'products-innerpage/product-personal-care-surgical-mask-x50.html' },
    { name: 'SD Hair net x 100',                  cat: 'Personal care',  img: base + 'assets/images/products/personal-care/hairnet.png',                     href: base + 'products-innerpage/product-personal-care-hair-net-x100.html' },
    { name: 'SD Glove x 100',                     cat: 'Personal care',  img: base + 'assets/images/products/personal-care/glove.png',                       href: base + 'products-innerpage/product-personal-care-glove-x100.html' },
    { name: 'UJALA Liquid Detergent 2L',          cat: 'Household',    img: base + 'assets/images/products/ujala/Ujala%202L.png',                         href: base + 'products-innerpage/product-ujala-whitener-2l.html' },
    { name: 'UJALA Powder 1kg & 500g',    cat: 'Household',    img: base + 'assets/images/products/ujala/Ujala_powder.png',                              href: base + 'products-innerpage/product-ujala-powder.html' },
    { name: 'UJALA Laundry Soap 150g',    cat: 'Household',    img: base + 'assets/images/products/ujala/Ujala_laudary_ soap.png',                       href: base + 'products-innerpage/product-ujala-laundry-soap.html' },
    { name: 'UJALA Detergent Soap 110g',  cat: 'Household',    img: base + 'assets/images/products/ujala/Ujala_Instant_Dissolver_soap.png',              href: base + 'products-innerpage/product-ujala-detergent-soap.html' },
    { name: 'MARGO Soap',                 cat: 'Household',    img: base + 'assets/images/products/margo_soap/Margo.png',                                href: base + 'products-innerpage/product-margo-soap.html' },
    { name: 'Neem Toothpaste',            cat: 'Household',    img: base + 'assets/images/products/Neem_toothpaste/Neem_toothpaste_packshot.png',        href: base + 'products-innerpage/product-neem-toothpaste.html' },
    { name: 'Super Napkin',               cat: 'Household',    img: base + 'assets/images/products/Napkin/napkin.png',                                   href: base + 'products-innerpage/product-super-napkin.html' },
    { name: 'Maya Incense Sticks',        cat: 'Religious Section',    img: base + 'assets/images/products/maya/Maya_Sandal_Big.png',                            href: base + 'products-innerpage/product-maya-incense.html' },
    { name: 'Super Bio Wooden Spoon',     cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Spoon.png',                                 href: base + 'products-innerpage/product-super-bio-wooden-spoon.html' },
    { name: 'Super Bio Wooden Fork',      cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Fork  packshot.png',                       href: base + 'products-innerpage/product-super-bio-wooden-fork.html' },
    { name: 'Super Bio Wooden Knife',     cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Knife packshot.png',                       href: base + 'products-innerpage/product-super-bio-wooden-knife.html' },
    { name: 'Super Bio Paper Cup',        cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Paper_Cup_75_200_260_300_ml.png',           href: base + 'products-innerpage/product-super-bio-paper-cup.html' },
    { name: 'Super Bio Plate',            cat: 'Compostable',  img: base + 'assets/images/products/super_bio/plate packshot.png',                       href: base + 'products-innerpage/product-super-bio-plate.html' },
    { name: 'Super Bio Take Away',        cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Take_Away_900ml.png',                      href: base + 'products-innerpage/product-super-bio-take-away.html' },
    { name: 'Super Bio Burger Box',       cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Burger_Box.png',                           href: base + 'products-innerpage/product-super-bio-burger-box.html' },
    { name: 'Super Bio Salad Bowl',       cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Salad_Bowl_500ml.png',                     href: base + 'products-innerpage/product-super-bio-salad-bowl.html' },
    { name: 'Super Bio Bowl + Lid',       cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Bowl_2B_Lid_1000ml.png',                   href: base + 'products-innerpage/product-super-bio-bowl-lid.html' },
    { name: 'Super Bio Tub',              cat: 'Compostable',  img: base + 'assets/images/products/super_bio/Tub_240_360_500_750_1000ml.png',           href: base + 'products-innerpage/product-super-bio-tub.html' },
    { name: 'Super Bio Coffee Cup (Single)', cat: 'Compostable', img: base + 'assets/images/products/super_bio/Coffee_cup_single_layer.png',             href: base + 'products-innerpage/product-super-bio-coffee-cup-single.html' },
    { name: 'Super Bio Coffee Cup (Double)', cat: 'Compostable', img: base + 'assets/images/products/super_bio/Coffee_cup_double_layer.png',             href: base + 'products-innerpage/product-super-bio-coffee-cup-double.html' }
  ];

  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.id = 'searchOverlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<button type="button" class="search-overlay-close" id="searchOverlayClose" aria-label="Close search">' +
      '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>' +
    '<div class="search-overlay-inner">' +
      '<label for="searchOverlayInput">Search products</label>' +
      '<form class="search-form-wrap" id="searchForm">' +
        '<input type="search" id="searchOverlayInput" class="search-overlay-input" placeholder="e.g. UJALA, Maya, Super Bio…" autocomplete="off">' +
        '<button type="submit" class="search-overlay-submit">Search</button>' +
      '</form>' +
      '<div class="search-products-grid" id="searchProductsGrid"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#searchOverlayInput');
  const form  = overlay.querySelector('#searchForm');
  const closeBtn = overlay.querySelector('#searchOverlayClose');
  const grid  = overlay.querySelector('#searchProductsGrid');
  if (!input || !form || !closeBtn || !grid) return;

  function matchProduct(p, term) {
    const name = p.name.toLowerCase();
    const cat = p.cat.toLowerCase();
    const words = term.split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    return words.every(w => name.includes(w) || cat.includes(w));
  }

  function renderCards(q) {
    const term = (q || '').trim().toLowerCase();
    const list = term
      ? products.filter(p => matchProduct(p, term))
      : products;
    if (!list.length) {
      grid.innerHTML = '<p class="search-no-results">No products found for "<strong>' + (q || '').replace(/</g, '&lt;') + '</strong>"</p>';
      return;
    }
    grid.innerHTML = list.map(p =>
      '<a href="' + p.href + '" class="search-prod-card">' +
        '<div class="search-prod-img-wrap">' +
          '<img src="' + p.img + '" alt="' + p.name + '" class="search-prod-img" loading="lazy" onerror="this.style.display=\'none\'">' +
        '</div>' +
        '<div class="search-prod-info">' +
          '<span class="search-prod-cat">' + p.cat + '</span>' +
          '<span class="search-prod-name">' + p.name + '</span>' +
        '</div>' +
      '</a>'
    ).join('');
  }

  function openSearch(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var qParam = '';
    try {
      var params = new URLSearchParams(window.location.search);
      qParam = (params.get('q') || '').trim();
    } catch (err) {}
    var scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.add('search-overlay-open');
    document.body.classList.add('search-overlay-open');
    document.body.style.setProperty('--scrollbar-w', scrollbarW + 'px');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarW > 0 ? scrollbarW + 'px' : '';
    document.documentElement.style.overflow = 'hidden';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = qParam;
    renderCards(qParam);
    input.focus();
  }
  function closeSearch() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    /* Delay clearing body styles until overlay close animation finishes to prevent layout shift/vibration */
    setTimeout(function() {
      document.documentElement.classList.remove('search-overlay-open');
      document.body.classList.remove('search-overlay-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.removeProperty('--scrollbar-w');
      document.documentElement.style.overflow = '';
    }, 380);
  }

  searchBtn.addEventListener('click', openSearch);
  closeBtn.addEventListener('click', function(e) { e.preventDefault(); closeSearch(); });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });
  input.addEventListener('input', function() {
    renderCards(input.value);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSearch();
  });
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var q = (input.value || '').trim();
    if (q) window.location.href = productsUrl + '?q=' + encodeURIComponent(q);
    else closeSearch();
  });
})();

/* =========================================
   HERO SLIDER
   ========================================= */
const slides   = document.querySelectorAll('.banner-slide');
const dots     = document.querySelectorAll('.dot');
const prevBtn  = document.getElementById('prevSlide');
const nextBtn  = document.getElementById('nextSlide');
let currentSlide  = 0;
let autoPlayTimer = null;
let isAnimating   = false;

function showSlide(index, dir = 'next') {
  if (!slides.length || !slides[index]) return;
  if (isAnimating || index === currentSlide) return;
  isAnimating = true;

  const cur  = slides[currentSlide];
  const next = slides[index];
  const xFrom = dir === 'next' ? '60px' : '-60px';

  // out
  gsap.to(cur, { opacity: 0, duration: 0.85, ease: 'power2.out' });
  gsap.to(cur.querySelector('.banner-slide-title'), {
    x: dir === 'next' ? '-40px' : '40px', opacity: 0, duration: 0.65
  });

  // prepare next: show its background immediately so no white flash
  next.classList.add('active');
  const nextBg = next.querySelector('.banner-slide-bg');
  if (nextBg) gsap.set(nextBg, { opacity: 1 });
  gsap.set(next,                              { opacity: 0 });
  gsap.set(next.querySelector('.banner-slide-tag'),  { y: 10, opacity: 0 });
  gsap.set(next.querySelector('.banner-slide-title'),{ x: xFrom, opacity: 0 });
  gsap.set(next.querySelector('.banner-slide-desc'), { y: 20, opacity: 0 });
  const img = next.querySelector('.banner-slide-image');
  if (img) gsap.set(img, { scale: 0.85, opacity: 0 });

  const tl = gsap.timeline({ delay: 0.15, onComplete: () => {
    cur.classList.remove('active');
    gsap.set(cur, { opacity: '' });
    isAnimating = false;
  }});

  tl.to(next, { opacity: 1, duration: 0.8 })
    .to(next.querySelector('.banner-slide-tag'),  { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to(next.querySelector('.banner-slide-title'),{ x: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, '-=0.4')
    .to(next.querySelector('.banner-slide-desc'), { y: 0, opacity: 1, duration: 0.75 }, '-=0.5');
  if (img) tl.to(img, { scale: 1, opacity: 1, duration: 1.25, ease: 'back.out(1.2)' }, '-=0.85');

  dots.forEach(d => d.classList.remove('active'));
  dots[index].classList.add('active');
  currentSlide = index;
}

function goNext() { if (!slides.length) return; showSlide((currentSlide + 1) % slides.length, 'next'); }
function goPrev() { if (!slides.length) return; showSlide((currentSlide - 1 + slides.length) % slides.length, 'prev'); }

function restartAutoPlay() {
  clearInterval(autoPlayTimer);
  if (slides.length) autoPlayTimer = setInterval(goNext, 14000);
}

if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); restartAutoPlay(); });
if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); restartAutoPlay(); });

dots.forEach(dot => dot.addEventListener('click', () => {
  const idx = parseInt(dot.dataset.index);
  showSlide(idx, idx > currentSlide ? 'next' : 'prev');
  restartAutoPlay();
}));

// Keyboard nav
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { goNext(); restartAutoPlay(); }
  if (e.key === 'ArrowLeft')  { goPrev(); restartAutoPlay(); }
});

// Touch/swipe
let touchX = 0;
document.querySelector('.banner')?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.querySelector('.banner')?.addEventListener('touchend',   e => {
  const diff = touchX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); restartAutoPlay(); }
}, { passive: true });

/* =========================================
   HERO — MOUSE-FOLLOW PARALLAX ON SLIDE IMAGES
   ========================================= */
(function heroMouseParallax() {
  const banner = document.getElementById('banner') || document.querySelector('.banner');
  if (!banner) return;

  const amount = 14; // max movement in px (lower = slower/smaller follow)

  function onMove(e) {
    const target = document.querySelector('.banner-slide.active .banner-slide-image-mouse');
    if (!target) return;
    const rect = banner.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const moveX = (x - 0.5) * amount;
    const moveY = (y - 0.5) * (amount * 0.75);
    target.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
  }

  function onLeave() {
    const target = document.querySelector('.banner-slide.active .banner-slide-image-mouse');
    if (target) target.style.transform = '';
  }

  banner.addEventListener('mousemove', onMove, { passive: true });
  banner.addEventListener('mouseleave', onLeave);
})();

// Entrance animation for first slide
(function initFirstSlide() {
  const s = slides[0];
  if (!s) return;
  gsap.set(s.querySelector('.banner-slide-tag'),   { y: 20, opacity: 0 });
  gsap.set(s.querySelector('.banner-slide-title'), { y: 70, opacity: 0, scale: 0.92 });
  gsap.set(s.querySelector('.banner-slide-desc'),  { y: 30, opacity: 0 });
  const img = s.querySelector('.banner-slide-image');
  if (img) gsap.set(img, { scale: 0.8, opacity: 0, x: 40 });

  const tl = gsap.timeline({ delay: 0.5 });
  tl.to(s.querySelector('.banner-slide-tag'),   { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to(s.querySelector('.banner-slide-title'), { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' }, '-=0.3')
    .to(s.querySelector('.banner-slide-desc'),  { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.5');
  if (img) tl.to(img, { scale: 1, opacity: 1, x: 0, duration: 1, ease: 'back.out(1.2)' }, '-=0.8');
})();

restartAutoPlay();

/* =========================================
   SCROLL PROGRESS BAR
   ========================================= */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position:fixed;top:0;left:0;height:3px;width:0%;
  background:linear-gradient(90deg,#E8171B,#FF4D4F);
  z-index:9999;pointer-events:none;transition:width 0.1s linear;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = Math.min(pct, 100) + '%';
}, { passive: true });

/* =========================================
   SCROLL ANIMATIONS — gsap.set → gsap.to
   ========================================= */

function scrollReveal(selector, options = {}) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  gsap.set(els, { y: options.y ?? 40, opacity: 0 });
  ScrollTrigger.create({
    trigger: els[0],
    start: 'top 85%',
    once: true,
    onEnter: () => gsap.to(els, {
      y: 0, opacity: 1,
      duration: options.duration ?? 0.7,
      ease: options.ease ?? 'power2.out',
      stagger: options.stagger ?? 0,
      delay: options.delay ?? 0
    })
  });
}

// Section headers (home)
scrollReveal('.coll-header', { y: 50, duration: 0.8 });
scrollReveal('.products .section-header',   { y: 40, duration: 0.8 });
scrollReveal('.partners .section-header',   { y: 40, duration: 0.8 });

// Site-wide scroll reveal (category, about, contact, reseller, product pages)
scrollReveal('.cat-page-hero-inner', { y: 40, duration: 0.75 });
scrollReveal('.cat-bento-card', { y: 36, duration: 0.7, stagger: 0.08 });
scrollReveal('.page-hero-inner', { y: 40, duration: 0.75 });
scrollReveal('.reseller-hero-inner', { y: 40, duration: 0.75 });
scrollReveal('.reseller-cta-inner', { y: 30, duration: 0.7 });
scrollReveal('.reseller-card', { y: 44, duration: 0.8 });
scrollReveal('.product-detail-inner', { y: 40, duration: 0.75 });
scrollReveal('.contact-inner', { y: 40, duration: 0.75 });
scrollReveal('.footer-inner', { y: 30, duration: 0.6 });

// Collection slider with animated clip-path shape and image
(function() {
  const track = document.getElementById('collTrack');
  const cards = Array.from(document.querySelectorAll('.coll-new-card'));
  const prevBtn = document.getElementById('collPrev');
  const nextBtn = document.getElementById('collNext');
  const dots = Array.from(document.querySelectorAll('.coll-dot'));
  if (!track || !cards.length) return;

  let index = 0;
  let animating = false;
  const total = cards.length;

  const CLIP_HIDDEN   = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
  const CLIP_FULL     = 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)';
  const CLIP_VISIBLE  = 'polygon(61% 0, 100% 0, 100% 100%, 0% 100%)';

  function animateCardIn(card, fromRight) {
    const shape = card.querySelector('.coll-right-shape');
    const img   = card.querySelector('.coll-new-img-wrap');
    const left  = card.querySelector('.coll-new-left');

    // Left panel: slide in then animate text (category, title, desc, cta) with stagger
    if (left) {
      const cat   = left.querySelector('.coll-new-cat');
      const title = left.querySelector('.coll-new-title');
      const desc  = left.querySelector('.coll-new-desc');
      const cta   = left.querySelector('.coll-new-cta');
      gsap.set([cat, title, desc, cta], { y: 22, opacity: 0 });
      gsap.fromTo(left,
        { x: fromRight ? -50 : 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.08 }
      );
      gsap.to([cat, title, desc, cta], {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.2
      });
    }

    // Single timeline: clip-path first, then image only after clip-path completes
    const tl = gsap.timeline({ delay: 0.12 });
    if (shape) {
      tl.fromTo(shape,
        { clipPath: CLIP_HIDDEN },
        { clipPath: CLIP_FULL, duration: 0.95, ease: 'power3.in' }
      ).to(shape,
        { clipPath: CLIP_VISIBLE, duration: 0.8, ease: 'power2.out' }
      );
    }
    // Image animation starts only after clip-path is done (position ">" = end of timeline)
    if (img) {
      gsap.set(img, { transformPerspective: 900, transformOrigin: 'center center' });
      const rotZ = fromRight ? -18 : 18;
      tl.fromTo(img,
        { x: fromRight ? 100 : -100, opacity: 0, rotateY: fromRight ? 40 : -40, rotateZ: rotZ, scale: 0.82 },
        { x: 0, opacity: 1, rotateY: 0, rotateZ: 0, scale: 1, duration: 1.05, ease: 'power3.out' },
        '>'  // start right after previous animation ends
      );
    }
  }

  function goTo(i, skipAnim) {
    if (animating && !skipAnim) return;
    const prev = index;
    index = Math.max(0, Math.min(i, total - 1));
    if (index === prev && !skipAnim) return;

    const w = track.parentElement.offsetWidth;
    const fromRight = index > prev;

    // Reset all non-active shapes, images, and text (clear mouse-tilt inline style too)
    cards.forEach((card, ci) => {
      if (ci !== index) {
        const s = card.querySelector('.coll-right-shape');
        if (s) gsap.set(s, { clipPath: CLIP_HIDDEN });
        const img = card.querySelector('.coll-new-img-wrap');
        if (img) {
          gsap.set(img, { x: 0, opacity: 1, rotateY: 0, rotateZ: 0, scale: 1 });
          img.style.transform = '';
        }
        const left = card.querySelector('.coll-new-left');
        if (left) {
          gsap.set(left, { x: 0, opacity: 1 });
          const textEls = left.querySelectorAll('.coll-new-cat, .coll-new-title, .coll-new-desc, .coll-new-cta');
          gsap.set(textEls, { y: 0, opacity: 1 });
        }
      }
    });

    if (skipAnim) {
      gsap.set(track, { x: -index * w });
      const s = cards[index].querySelector('.coll-right-shape');
      if (s) gsap.set(s, { clipPath: CLIP_VISIBLE });
    } else {
      animating = true;
      gsap.to(track, {
        x: -index * w,
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => { animating = false; }
      });
      animateCardIn(cards[index], fromRight);
    }

    dots.forEach((d, j) => d.classList.toggle('active', j === index));
    cards.forEach((c, j) => c.classList.toggle('coll-card-active', j === index));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(index - 1); resetCollAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(index + 1); resetCollAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetCollAuto(); }));

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? index + 1 : index - 1); resetCollAuto(); }
  }, { passive: true });

  window.addEventListener('resize', () => goTo(index, true));

  // Auto-advance: runs until user hovers/focuses the section, then resumes on mouse/focus leave
  const COLL_AUTO_MS = 5000;
  let collAutoTimer = null;
  function startCollAuto() {
    clearInterval(collAutoTimer);
    collAutoTimer = setInterval(function() {
      goTo(index + 1 >= total ? 0 : index + 1);
    }, COLL_AUTO_MS);
  }
  function stopCollAuto() {
    clearInterval(collAutoTimer);
    collAutoTimer = null;
  }
  function resetCollAuto() {
    stopCollAuto();
    startCollAuto();
  }

  const sliderWrap = document.querySelector('.coll-slider-wrap');
  if (sliderWrap) {
    sliderWrap.addEventListener('mouseenter', stopCollAuto);
    sliderWrap.addEventListener('mouseleave', startCollAuto);
    sliderWrap.addEventListener('focusin',  stopCollAuto);
    sliderWrap.addEventListener('focusout', startCollAuto);
  }

  // Initial: first card fully visible, rest hidden at right edge
  cards.forEach((card, i) => {
    const shape = card.querySelector('.coll-right-shape');
    if (shape) gsap.set(shape, { clipPath: i === 0 ? CLIP_VISIBLE : CLIP_HIDDEN });
    if (i !== 0) {
      const imgEl = card.querySelector('.coll-new-img-wrap');
      if (imgEl) gsap.set(imgEl, { opacity: 1, x: 0, rotateY: 0, rotateZ: 0, scale: 1 });
    }
  });
  goTo(0, true);
  startCollAuto();
})();

// Collection: 3D tilt on image only when mouse is over the RIGHT side (.coll-new-right) of the active card
(function() {
  const section = document.querySelector('.collection');
  if (!section) return;

  const maxTilt = 16;
  let raf = null;

  function getActiveCard() {
    return section.querySelector('.coll-new-card.coll-card-active');
  }

  function setTilt(el, rx, ry) {
    if (!el) return;
    el.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
  }

  function clearTilt(el) {
    if (el) el.style.transform = '';
  }

  section.addEventListener('mousemove', function(e) {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function() {
      const card = getActiveCard();
      if (!card) return;
      const rightPanel = card.querySelector('.coll-new-right');
      if (!rightPanel) return;
      const rect = rightPanel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        clearTilt(card.querySelector('.coll-new-img-wrap'));
        raf = null;
        return;
      }
      const wrap = card.querySelector('.coll-new-img-wrap');
      if (!wrap) return;
      const nx = (x / rect.width - 0.5) * 2;
      const ny = (y / rect.height - 0.5) * -2;
      const ry = nx * maxTilt;
      const rx = ny * maxTilt;
      setTilt(wrap, rx, ry);
      raf = null;
    });
  }, { passive: true });

  section.addEventListener('mouseleave', function() {
    const card = getActiveCard();
    if (card) clearTilt(card.querySelector('.coll-new-img-wrap'));
  });
})();

// Collection section reveal
(function() {
  const wrap = document.querySelector('.coll-slider-wrap');
  if (!wrap) return;
  gsap.set(wrap, { y: 50, opacity: 0 });
  ScrollTrigger.create({
    trigger: '.collection', start: 'top 82%', once: true,
    onEnter: () => gsap.to(wrap, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
  });
})();

// Homepage: product tabs + grid animation (run together so filter and GSAP don't conflict)
(function() {
  function run() {
    var tabsWrap = document.getElementById('prodFilterTabs');
    var grid = document.getElementById('productsGrid');
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/98aa9fc5-cf75-4ae1-a6d9-2bf518924633',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:home-tabs-run',message:'home tab init',data:{hasTabsWrap:!!tabsWrap,hasGrid:!!grid},timestamp:Date.now(),hypothesisId:'H1'})}).catch(function(){});
    // #endregion
    if (!tabsWrap || !grid) return;

    var cards = grid.querySelectorAll('.product-card');
    if (!cards.length) return;

    function getItemCategory(item) {
      var card = item.classList.contains('product-card') ? item : item.querySelector('.product-card');
      return card ? (card.getAttribute('data-cat') || '') : '';
    }

    var currentCat = 'all';
    function applyFilter(cat, animateEntrance) {
      currentCat = cat;
      var tabs = tabsWrap.querySelectorAll('.prod-tab');
      var items = Array.from(grid.children);
      tabs.forEach(function(t) { t.classList.toggle('active', t.getAttribute('data-cat') === cat); });
      var matching = items.filter(function(item) { return cat === 'all' || getItemCategory(item) === cat; });
      items.forEach(function(item) { item.classList.add('hidden'); });
      var toShow = matching.slice(0, 8);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/98aa9fc5-cf75-4ae1-a6d9-2bf518924633',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.js:applyFilter',message:'home applyFilter',data:{cat:cat,matchingLen:matching.length,toShowLen:toShow.length},timestamp:Date.now(),hypothesisId:'H3'})}).catch(function(){});
      // #endregion
      toShow.forEach(function(item) { item.classList.remove('hidden'); });
      var cardsToAnimate = toShow.map(function(item) {
        return item.classList.contains('product-card') ? item : item.querySelector('.product-card');
      }).filter(Boolean);
      if (animateEntrance && typeof gsap !== 'undefined' && gsap.set && gsap.to) {
        gsap.set(cardsToAnimate, { opacity: 0, y: 28, scale: 0.94 });
        gsap.to(cardsToAnimate, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.52,
          ease: 'back.out(1.18)',
          stagger: 0.06,
          overwrite: true
        });
      } else {
        if (typeof gsap !== 'undefined' && gsap.set) {
          cardsToAnimate.forEach(function(card) { gsap.set(card, { opacity: 1, y: 0, scale: 1 }); });
        } else {
          toShow.forEach(function(item) {
            var card = item.classList.contains('product-card') ? item : item.querySelector('.product-card');
            if (card) {
              card.style.opacity = '1';
              card.style.transform = '';
            }
          });
        }
      }
    }

    // Click on tabs (use capture so we get the event first)
    tabsWrap.addEventListener('click', function(e) {
      var tab = e.target.closest('.prod-tab');
      if (!tab) return;
      e.preventDefault();
      e.stopPropagation();
      var cat = tab.getAttribute('data-cat');
      if (!cat) return;
      applyFilter(cat, true);
    }, true);

    applyFilter('all', false);

    // GSAP: hide all cards initially, reveal on scroll; then re-apply filter so visible 8 stay visible
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.set(cards, { y: 50, opacity: 0, scale: 0.96 });
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 82%',
        once: true,
        onEnter: function() {
          gsap.to(cards, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.2)', stagger: 0.07 });
        }
      });
      applyFilter(currentCat, false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

// Stats counters (only when GSAP + ScrollTrigger exist)
if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
  document.querySelectorAll('.stat-item').forEach(function(item) {
    var numEl = item.querySelector('.stat-num');
    var target = parseInt(item.dataset.count, 10) || 0;
    var suffix = item.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: item,
      start: 'top 82%',
      once: true,
      onEnter: function() {
        var obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: function() {
            if (numEl) numEl.textContent = Math.round(obj.val) + suffix;
          }
        });
      }
    });
  });
}

// Partner grid items
(function() {
  const items = document.querySelectorAll('.pgd-item');
  if (!items.length) return;
  gsap.set(items, { scale: 0.85, opacity: 0 });
  ScrollTrigger.create({
    trigger: '#partnerGrid', start: 'top 80%', once: true,
    onEnter: () => gsap.to(items, {
      scale: 1, opacity: 1, duration: 0.5,
      ease: 'back.out(1.4)',
      stagger: { amount: 0.6, grid: 'auto', from: 'center' }
    })
  });
})();

// CTA banner
scrollReveal('.cta-title',    { y: 50, duration: 0.8 });
scrollReveal('.cta-subtitle', { y: 40, duration: 0.7, delay: 0.12 });
scrollReveal('.cta-actions',  { y: 40, duration: 0.7, delay: 0.24 });

// CTA Email Us dropdown: Copy email or Open in Gmail
(function() {
  var trigger = document.getElementById('ctaEmailTrigger');
  var dropdown = document.getElementById('ctaEmailDropdown');
  var wrap = trigger && trigger.closest('.cta-email-dropdown-wrap');
  if (!trigger || !dropdown || !wrap) return;
  var copyBtn = dropdown.querySelector('[data-action="copy"]');

  function open() {
    wrap.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.setAttribute('aria-hidden', 'false');
  }
  function close() {
    wrap.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('aria-hidden', 'true');
    if (copyBtn) {
      copyBtn.textContent = 'Copy email address';
      copyBtn.classList.remove('copied');
    }
  }

  trigger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (wrap.classList.contains('is-open')) close();
    else open();
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var emailToCopy = copyBtn.getAttribute('data-email') || 'superdistributionltd@gmail.com';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailToCopy).then(function() {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(close, 1200);
        });
      } else {
        close();
      }
    });
  }

  dropdown.querySelectorAll('a.cta-email-option').forEach(function(link) {
    link.addEventListener('click', function() { close(); });
  });

  document.addEventListener('click', function(e) {
    if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) close();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && wrap.classList.contains('is-open')) close();
  });
})();

// Footer
(function() {
  const cols = document.querySelectorAll('.footer-brand, .footer-col');
  if (!cols.length) return;
  gsap.set(cols, { y: 30, opacity: 0 });
  ScrollTrigger.create({
    trigger: '.footer', start: 'top 85%', once: true,
    onEnter: () => gsap.to(cols, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 })
  });
})();

/* =========================================
   SMOOTH SCROLL
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerEl = document.getElementById('header');
      const navH = headerEl ? headerEl.offsetHeight : 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    }
  });
});

/* =========================================
   NAV ACTIVE STATE ON SCROLL
   ========================================= */
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px -30% 0px' });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

/* =========================================
   PRODUCT CARD — 3D TILT ON HOVER
   ========================================= */
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const rx = -((e.clientY - rect.top  - rect.height / 2) / rect.height) * 5;
    const ry =  ((e.clientX - rect.left - rect.width  / 2) / rect.width)  * 5;
    gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 700, duration: 0.5, ease: 'power2.out' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
  });
});


/* =========================================
   BANNER PARALLAX ON SCROLL (scroll-down effect preserved)
   ========================================= */
/* Hero slider stays fixed — no scroll parallax to avoid top gap / blue strip */

/* =========================================
   SOCIAL LINK HOVER
   ========================================= */
document.querySelectorAll('.social-link').forEach(link => {
  link.addEventListener('mouseenter', () => gsap.to(link, { y: -4, duration: 0.25, ease: 'power2.out' }));
  link.addEventListener('mouseleave', () => gsap.to(link, { y:  0, duration: 0.3,  ease: 'power2.out' }));
});

/* =========================================
   FLOATING STAGGER DELAY for product art
   ========================================= */
document.querySelectorAll('.p-item-art').forEach((el, i) => {
  el.style.animationDelay = `${i * 0.2}s`;
});

/* =========================================
   FLOATING BUTTONS: social + reseller + whatsapp (above) + scroll to top (below)
   ========================================= */
(function() {
  var wrap = document.createElement('div');
  wrap.className = 'float-buttons-wrap';

  var group = document.createElement('div');
  group.className = 'float-buttons-group';

  var fb = document.createElement('a');
  fb.className = 'float-btn float-btn-fb';
  fb.href = 'https://www.facebook.com/superdistributionltd/';
  fb.target = '_blank';
  fb.rel = 'noopener noreferrer';
  fb.setAttribute('aria-label', 'Facebook');
  fb.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';

  var ig = document.createElement('a');
  ig.className = 'float-btn float-btn-insta';
  ig.href = 'https://www.instagram.com/superdistribution';
  ig.target = '_blank';
  ig.rel = 'noopener noreferrer';
  ig.setAttribute('aria-label', 'Instagram');
  ig.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>';

  var wa = document.createElement('a');
  wa.className = 'float-btn float-btn-wa';
  wa.href = 'https://wa.me/23052513078?text=Hello%2C%20I%27d%20like%20to%20enquire%20about%20your%20products.';
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  wa.setAttribute('aria-label', 'WhatsApp');
  wa.innerHTML = '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>';

  var reseller = document.createElement('a');
  reseller.className = 'float-btn float-btn-reseller';
  reseller.href = document.location.pathname.indexOf('products-innerpage') !== -1 ? '../reseller-application.html' : 'reseller-application.html';
  reseller.setAttribute('aria-label', 'Become a reseller');
  reseller.innerHTML = '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';

  group.appendChild(fb);
  group.appendChild(ig);
  group.appendChild(wa);
  group.appendChild(reseller);
  wrap.appendChild(group);

  var scrollBtn = document.createElement('button');
  scrollBtn.type = 'button';
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>';
  wrap.appendChild(scrollBtn);

  document.body.appendChild(wrap);

  function updateVisibility() {
    if (window.scrollY > 400) scrollBtn.classList.add('visible');
    else scrollBtn.classList.remove('visible');
  }
  scrollBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
})();

console.log('%cSuper Distribution', 'color: #E8171B; font-size: 1.5rem; font-weight: bold;');
console.log('%cMauritius Household Goods Distributor', 'color: #666; font-size: 0.9rem;');
