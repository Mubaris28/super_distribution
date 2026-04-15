/* ============================================
   SUPER DISTRIBUTION — NAV (dropdowns + mobile submenu)
   Single source for Products dropdown: Household, Compostable, Cosmetic, Religious, Stationery
   ============================================ */
'use strict';

(function() {

  /* Products menu: categories (update here to change on all pages that use this structure) */
  window.SDNavConfig = {
    productsDropdown: [
      { label: 'Household', href: 'household.html' },
      { label: 'Compostable', href: 'compostable.html' },
      { label: 'Cosmetic', href: 'cosmetic.html' },
      { label: 'Religious', href: 'religious.html' },
      { label: 'Stationery', href: 'stationary.html' }
    ]
  };

  function initDropdowns() {
    var productsDropdown = document.getElementById('productsDropdown');
    var aboutDropdown = document.getElementById('aboutDropdown');

    /* Close dropdown when clicking outside */
    document.addEventListener('click', function(e) {
      if (productsDropdown && !productsDropdown.contains(e.target)) productsDropdown.classList.remove('open');
      if (aboutDropdown && !aboutDropdown.contains(e.target)) aboutDropdown.classList.remove('open');
    });
  }

  function collapseAllMobileSubs() {
    document.querySelectorAll('.mm-sub.open').forEach(function(ul) { ul.classList.remove('open'); });
    document.querySelectorAll('.mm-chevron').forEach(function(chev) { chev.style.transform = ''; });
  }

  function initMobileSubmenu() {
    var menuClose = document.getElementById('menuClose');
    var menuOverlay = document.getElementById('menuOverlay');
    if (menuClose) menuClose.addEventListener('click', collapseAllMobileSubs);
    if (menuOverlay) menuOverlay.addEventListener('click', collapseAllMobileSubs);

    document.querySelectorAll('.mm-has-sub .mm-parent').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var sub = btn.nextElementSibling;
        var chev = btn.querySelector('.mm-chevron');
        if (!sub || !sub.classList.contains('mm-sub')) return;
        sub.classList.toggle('open');
        if (chev) chev.style.transform = sub.classList.contains('open') ? 'rotate(180deg)' : '';
      });
    });
  }

  function init() {
    initDropdowns();
    initMobileSubmenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
