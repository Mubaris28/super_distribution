/**
 * Index / Home page — product filter tabs (Our Products section)
 */
(function () {
  var tabsWrap = document.getElementById('prodFilterTabs');
  var grid = document.getElementById('productsGrid');
  if (!tabsWrap || !grid) return;
  function cat(item) {
    var c = item.querySelector('.product-card');
    return c ? (c.getAttribute('data-cat') || '') : '';
  }
  function filter(catName) {
    var tabs = tabsWrap.querySelectorAll('.prod-tab');
    var items = Array.from(grid.children);
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-cat') === catName); });
    var match = items.filter(function (item) { return catName === 'all' || cat(item) === catName; });
    items.forEach(function (item) { item.classList.add('hidden'); });
    match.slice(0, 8).forEach(function (item) {
      item.classList.remove('hidden');
      var card = item.querySelector('.product-card');
      if (card) { card.style.opacity = '1'; card.style.transform = ''; }
    });
  }
  tabsWrap.addEventListener('click', function (e) {
    var tab = e.target.closest('.prod-tab');
    if (!tab) return;
    e.preventDefault();
    filter(tab.getAttribute('data-cat') || 'all');
  });
  filter('all');
})();
