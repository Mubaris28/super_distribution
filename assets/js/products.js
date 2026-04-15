/* ============================================
   PRODUCTS PAGE — tabs, search, GSAP, initial category
   Load only on products.html (after main.js, nav.js)
   ============================================ */

'use strict';

(function() {

  // ——— Navbar scroll ———
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ——— Hamburger / mobile menu ———
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuClose = document.getElementById('menuClose');
  if (hamburger && mobileMenu && menuOverlay && menuClose) {
    function openMenu() {
      mobileMenu.classList.add('open');
      menuOverlay.classList.add('open');
    }
    function closeMenu() {
      mobileMenu.classList.remove('open');
      menuOverlay.classList.remove('open');
    }
    hamburger.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);
  }

  // ——— URL params ———
  var params = new URLSearchParams(window.location.search);
  var catParam = params.get('cat');
  var qParam = params.get('q');

  // Search overlay is fully handled in main.js (opens with ?q= prefilled and results rendered)

  // ——— Category tabs + card entrance ———
  var listenerAttached = false;

  function selectCategory(cat) {
    var el = document.querySelector('.products-page-section');
    var te = document.getElementById('productsTabs');
    if (!el || !te) return;
    if (!cat) cat = 'all';

    var tabs = te.querySelectorAll('.products-tab');
    var groups = el.querySelectorAll('.prod-group');
    var i, j, g, t, hasVisibleGroup = false;

    for (i = 0; i < tabs.length; i++) {
      t = tabs[i];
      t.classList.toggle('active', t.getAttribute('data-cat') === cat);
      t.setAttribute('aria-selected', t.getAttribute('data-cat') === cat ? 'true' : 'false');
    }

    for (j = 0; j < groups.length; j++) {
      g = groups[j];
      var show = (cat === 'all' || g.getAttribute('data-group') === cat);
      if (show) hasVisibleGroup = true;
      g.style.display = show ? '' : 'none';
    }

    if (!hasVisibleGroup && cat !== 'all') {
      for (j = 0; j < groups.length; j++) {
        groups[j].style.display = '';
      }
    }

    var cardsToShow = cat === 'all'
      ? el.querySelectorAll('.product-card')
      : el.querySelectorAll('.prod-group[data-group="' + cat + '"] .product-card');
    var cardsArray = Array.prototype.slice.call(cardsToShow);

    if (cardsArray.length > 0) {
      if (typeof gsap !== 'undefined' && gsap.set && gsap.to) {
        gsap.set(cardsArray, { opacity: 0, y: 28, scale: 0.94 });
        gsap.to(cardsArray, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.52,
          ease: 'back.out(1.18)',
          stagger: 0.06,
          overwrite: true
        });
      } else {
        cardsArray.forEach(function(card) {
          card.style.opacity = '1';
          card.style.transform = '';
        });
      }
    }
  }

  function initTabs() {
    var tabsEl = document.getElementById('productsTabs');
    var section = document.querySelector('.products-page-section');
    return !!(tabsEl && section);
  }

  function onTabClick(e) {
    var target = e && e.target;
    if (!target || typeof target.closest !== 'function') return;
    var tab = target.closest('.products-tab');
    if (!tab) return;
    var tabsRoot = document.getElementById('productsTabs');
    if (!tabsRoot || !tab.closest('#productsTabs')) return;
    e.preventDefault();
    e.stopPropagation();
    var cat = tab.getAttribute('data-cat');
    selectCategory(cat || 'all');
  }

  function runTabs() {
    if (listenerAttached) return;
    if (!initTabs()) return;
    listenerAttached = true;
    document.addEventListener('click', onTabClick, true);
  }

  function bootTabs() {
    runTabs();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootTabs);
  } else {
    setTimeout(bootTabs, 0);
  }

  // ——— GSAP: group labels + initial category (after tabs ready) ———
  function initProductsSection() {
    var section = document.querySelector('.products-page-section');
    if (!section) return;

    var hasTabs = !!document.getElementById('productsTabs');

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      try {
        if (typeof gsap.registerPlugin === 'function') gsap.registerPlugin(ScrollTrigger);
        if (!hasTabs) {
          var cards = section.querySelectorAll('.product-card');
          if (cards.length) {
            gsap.set(cards, { y: 36, opacity: 0, scale: 0.94 });
            ScrollTrigger.batch(cards, {
              start: 'top 90%',
              onEnter: function(batch) {
                gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.055, ease: 'back.out(1.15)' });
              }
            });
          }
        }
        var groupLabels = section.querySelectorAll('.prod-group-label');
        if (groupLabels.length) {
          gsap.set(groupLabels, { opacity: 0, x: -20 });
          ScrollTrigger.batch(groupLabels, {
            start: 'top 92%',
            onEnter: function(batch) {
              gsap.to(batch, { opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' });
            }
          });
        }
      } catch (err) { /* ignore */ }
    }

    runTabs();
    if (catParam && catParam.trim()) {
      selectCategory(catParam.trim());
    } else if (qParam && qParam.trim()) {
      var q = qParam.trim().toLowerCase();
      selectCategory('all');
      section.querySelectorAll('.prod-group').forEach(function(grp) {
        grp.style.display = '';
      });
      section.querySelectorAll('.products-tab').forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-cat') === 'all') btn.classList.add('active');
      });
      var gridItems = section.querySelectorAll('.products-grid > *');
      var hasMatch = false;
      gridItems.forEach(function(item) {
        var card = item.querySelector('.product-card');
        var label = card ? (card.querySelector('.product-card-label') || card).textContent || '' : '';
        var match = label.toLowerCase().indexOf(q) !== -1;
        if (match) hasMatch = true;
        item.classList.toggle('search-hidden', !match);
      });
      if (hasMatch) {
        var first = section.querySelector('.products-grid > *:not(.search-hidden)');
        if (first && first.scrollIntoView) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      selectCategory('all');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsSection);
  } else {
    setTimeout(initProductsSection, 0);
  }

})();
