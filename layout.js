/**
 * Paavan marketplace — shared chrome (Amazon / Flipkart–style header & footer).
 * Replace LEGAL_NAME and domain in footer for your production domain.
 */
(function (global) {
  var LEGAL_NAME = 'Paavan Retail GmbH';
  var SHOP_TAGLINE = 'Paavan.de';

  var nav = [
    { href: 'index.html', id: 'home', label: 'Home' },
    { href: 'catalog.html', id: 'catalog', label: 'All products' },
    { href: 'catalog.html?category=Electronics', id: 'elec', label: 'Electronics' },
    { href: 'catalog.html?category=Fashion', id: 'fash', label: 'Fashion' },
    { href: 'catalog.html?category=Home', id: 'homecat', label: 'Home' },
    { href: 'catalog.html?category=Sports', id: 'sport', label: 'Sports' },
  ];

  function cartCount() {
    try {
      var raw = localStorage.getItem('Paavan-cart');
      var cart = raw ? JSON.parse(raw) : [];
      return cart.reduce(function (n, line) {
        return n + (line.qty || 0);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  function headerHtml(activeId) {
    var c = cartCount();
    var catLinks = nav
      .map(function (item) {
        var cls = item.id === activeId ? ' class="nav-cat is-active"' : ' class="nav-cat"';
        return '<a href="' + item.href + '"' + cls + '>' + item.label + '</a>';
      })
      .join('');

    return (
      '<div class="top-bar">' +
      '<div class="top-bar-inner wrap">' +
      '<span class="top-bar-msg">Ships to <strong>Germany &amp; EU</strong> · Free delivery from €29</span>' +
      '<span class="top-bar-msg">' +
      '<a href="shipping.html">Shipping</a> · <a href="returns.html">Returns</a> · <a href="contact.html">Help</a>' +
      '</span></div></div>' +
      '<div class="main-header wrap">' +
      '<a href="index.html" class="logo"><span class="logo-mark">P</span><span class="logo-text">aavan</span></a>' +
      '<form class="search-bar" action="catalog.html" method="get" role="search">' +
      '<input type="search" name="q" placeholder="Search fashion, electronics, home…" aria-label="Search products" />' +
      '<button type="submit" class="search-btn">Search</button></form>' +
      '<div class="header-actions">' +
      '<a href="cart.html" class="cart-link" aria-label="Shopping cart">' +
      '<span class="cart-icon">🛒</span> <span>Cart</span>' +
      (c ? '<span class="cart-badge">' + c + '</span>' : '') +
      '</a></div></div>' +
      '<nav class="category-nav wrap" aria-label="Product categories">' +
      catLinks +
      '</nav>'
    );
  }

  function footerHtml() {
    return (
      '<div class="footer-grid wrap">' +
      '<div><h4>Get to know us</h4><ul>' +
      '<li><a href="about.html">About ' + LEGAL_NAME + '</a></li>' +
      '<li><a href="contact.html">Contact &amp; imprint</a></li>' +
      '<li><a href="features.html">CleverPush engagement</a></li>' +
      '</ul></div>' +
      '<div><h4>Shop with confidence</h4><ul>' +
      '<li><a href="shipping.html">Shipping rates &amp; times</a></li>' +
      '<li><a href="returns.html">Returns &amp; refunds</a></li>' +
      '<li><a href="contact.html">Track your order</a></li>' +
      '</ul></div>' +
      '<div><h4>Legal</h4><ul>' +
      '<li><a href="contact.html#imprint">Imprint</a></li>' +
      '<li><a href="returns.html">Withdrawal policy</a></li>' +
      '<li>Payments: cards, PayPal, Klarna (where available)</li>' +
      '</ul></div></div>' +
      '<div class="footer-bottom wrap">' +
      '<p>© ' +
      new Date().getFullYear() +
      ' <strong>' +
      LEGAL_NAME +
      '</strong> · ' +
      SHOP_TAGLINE +
      ' · We sell <strong>tangible physical products</strong> only. CleverPush is used for customer notifications; all orders are fulfilled by ' +
      LEGAL_NAME +
      '.</p></div>'
    );
  }

  function inject(activeId) {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    var nav = activeId || (document.body && document.body.getAttribute('data-nav-active')) || 'home';
    if (h) h.innerHTML = headerHtml(nav);
    if (f) f.innerHTML = footerHtml();
  }

  global.ShopLayout = {
    inject: inject,
    legalName: LEGAL_NAME,
    refreshCartBadge: function () {
      inject();
    },
  };
})(typeof window !== 'undefined' ? window : this);
