(function (global) {
  var CART_KEY = 'nordstrand-cart';

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setCart(lines) {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
    if (global.ShopLayout) ShopLayout.refreshCartBadge();
  }

  function addToCart(productId, qty) {
    qty = qty || 1;
    var cart = getCart();
    var found = cart.find(function (l) {
      return l.id === productId;
    });
    if (found) found.qty += qty;
    else cart.push({ id: productId, qty: qty });
    setCart(cart);
  }

  function updateLine(productId, qty) {
    var cart = getCart().filter(function (l) {
      return l.id !== productId;
    });
    if (qty > 0) cart.push({ id: productId, qty: qty });
    setCart(cart);
  }

  function removeLine(productId) {
    setCart(
      getCart().filter(function (l) {
        return l.id !== productId;
      })
    );
  }

  function formatPrice(price, currency) {
    return (
      new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency || 'EUR',
      }).format(price)
    );
  }

  function imgUrl(seed) {
    return 'https://picsum.photos/seed/' + seed + '/400/400';
  }

  function productCard(p) {
    var href = 'product.html?id=' + encodeURIComponent(p.id);
    return (
      '<article class="p-card">' +
      '<a href="' +
      href +
      '" class="p-card-img-wrap"><img src="' +
      imgUrl(p.seed) +
      '" alt="" loading="lazy" width="400" height="400"/></a>' +
      '<div class="p-card-body">' +
      '<a href="' +
      href +
      '" class="p-card-title">' +
      escapeHtml(p.title) +
      '</a>' +
      '<div class="p-card-meta"><span class="p-stars">★★★★☆</span> <span class="p-reviews">(128)</span></div>' +
      '<div class="p-card-price">' +
      formatPrice(p.price, p.currency) +
      '</div>' +
      '<div class="p-card-ship">FREE delivery <strong>Tomorrow</strong> on orders over €29</div>' +
      '<button type="button" class="btn-atc" data-product-id="' +
      escapeHtml(p.id) +
      '">Add to cart</button>' +
      '</div></article>'
    );
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  var productsCache = null;

  function loadProducts(cb) {
    if (productsCache) {
      cb(productsCache);
      return;
    }
    fetch('products.json')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        productsCache = data;
        cb(data);
      })
      .catch(function () {
        cb([]);
      });
  }

  function bindAtc(container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-atc');
      if (!btn) return;
      var id = btn.getAttribute('data-product-id');
      if (id) {
        addToCart(id, 1);
        btn.textContent = 'Added ✓';
        setTimeout(function () {
          btn.textContent = 'Add to cart';
        }, 1500);
      }
    });
  }

  function initHome() {
    var el = document.getElementById('product-grid-home');
    if (!el) return;
    loadProducts(function (all) {
      el.innerHTML = all
        .slice(0, 12)
        .map(productCard)
        .join('');
      bindAtc(el);
    });
  }

  function initDeals() {
    var el = document.getElementById('deals-strip');
    if (!el) return;
    loadProducts(function (all) {
      el.innerHTML = all
        .slice(12, 18)
        .map(function (p) {
          var href = 'product.html?id=' + encodeURIComponent(p.id);
          return (
            '<div class="deal-card">' +
            '<a href="' +
            href +
            '"><img src="' +
            imgUrl(p.seed) +
            '" alt="" loading="lazy" width="200" height="200"/></a>' +
            '<a href="' +
            href +
            '" class="deal-title">' +
            escapeHtml(p.title.substring(0, 40)) +
            (p.title.length > 40 ? '…' : '') +
            '</a>' +
            '<div class="deal-price">' +
            formatPrice(p.price * 0.85, p.currency) +
            ' <s class="deal-was">' +
            formatPrice(p.price, p.currency) +
            '</s></div></div>'
          );
        })
        .join('');
    });
  }

  function initCatalog() {
    var el = document.getElementById('catalog-grid');
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('category');
    var q = (params.get('q') || '').toLowerCase();

    loadProducts(function (all) {
      var list = all.filter(function (p) {
        if (cat && p.category !== cat) return false;
        if (q && p.title.toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      document.getElementById('catalog-count').textContent = list.length + ' products';
      el.innerHTML = list.length ? list.map(productCard).join('') : '<p class="empty-catalog">No products match your filters.</p>';
      bindAtc(el);

      var catNorm = cat || '';
      document.querySelectorAll('.filter-cat').forEach(function (a) {
        var ac = a.getAttribute('data-category') || '';
        a.classList.toggle('is-on', ac === catNorm);
      });
    });
  }

  function initProduct() {
    var el = document.getElementById('product-detail');
    if (!el) return;
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      el.innerHTML = '<p>Product not found.</p>';
      return;
    }
    loadProducts(function (all) {
      var p = all.find(function (x) {
        return x.id === id;
      });
      if (!p) {
        el.innerHTML = '<p>Product not found.</p>';
        return;
      }
      document.title = p.title + ' — Nordstrand';
      el.innerHTML =
        '<div class="pd-grid">' +
        '<div class="pd-gallery"><img src="' +
        imgUrl(p.seed) +
        '" alt="" width="600" height="600"/></div>' +
        '<div class="pd-buy">' +
        '<p class="pd-breadcrumb"><a href="catalog.html">All</a> › ' +
        escapeHtml(p.category) +
        '</p>' +
        '<h1 class="pd-title">' +
        escapeHtml(p.title) +
        '</h1>' +
        '<div class="pd-rating"><span class="p-stars">★★★★☆</span> <a href="#reviews">4.2 · 128 ratings</a></div>' +
        '<div class="pd-price-block"><span class="pd-price">' +
        formatPrice(p.price, p.currency) +
        '</span> <span class="pd-vat">Price includes VAT</span></div>' +
        '<p class="pd-stock text-success">In stock · Ships within 24 hours</p>' +
        '<div class="pd-actions">' +
        '<label>Qty <select id="pd-qty">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          .map(function (n) {
            return '<option value="' + n + '">' + n + '</option>';
          })
          .join('') +
        '</select></label>' +
        '<button type="button" class="btn-primary-lg" id="pd-atc">Add to cart</button>' +
        '<button type="button" class="btn-secondary-lg" id="pd-buy">Buy now</button>' +
        '</div>' +
        '<ul class="pd-trust"><li>✓ Secure checkout</li><li>✓ 30-day returns</li><li>✓ 2-year warranty on electronics</li></ul>' +
        '</div></div>' +
        '<section class="pd-desc wrap"><h2>About this item</h2><p>' +
        escapeHtml(p.description) +
        '</p></section>' +
        '<section class="pd-reviews wrap" id="reviews"><h2>Customer reviews</h2><p>Sample reviews for demo storefront. Verified purchases only on production.</p></section>';

      document.getElementById('pd-atc').addEventListener('click', function () {
        var q = parseInt(document.getElementById('pd-qty').value, 10) || 1;
        addToCart(p.id, q);
        this.textContent = 'Added to cart ✓';
      });
      document.getElementById('pd-buy').addEventListener('click', function () {
        var q = parseInt(document.getElementById('pd-qty').value, 10) || 1;
        addToCart(p.id, q);
        window.location.href = 'cart.html';
      });
    });
  }

  function initCart() {
    var tbody = document.querySelector('#cart-table tbody');
    var subEl = document.getElementById('cart-subtotal');
    if (!tbody) return;
    loadProducts(function (all) {
      var cart = getCart();
      var subtotal = 0;
      tbody.innerHTML = '';
      cart.forEach(function (line) {
        var p = all.find(function (x) {
          return x.id === line.id;
        });
        if (!p) return;
        var lineTotal = p.price * line.qty;
        subtotal += lineTotal;
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><div class="cart-line"><img src="' +
          imgUrl(p.seed) +
          '" alt="" width="80" height="80"/><div><a href="product.html?id=' +
          encodeURIComponent(p.id) +
          '">' +
          escapeHtml(p.title) +
          '</a></div></div></td>' +
          '<td>' +
          formatPrice(p.price, p.currency) +
          '</td>' +
          '<td><input type="number" min="0" max="99" class="cart-qty" data-id="' +
          escapeHtml(p.id) +
          '" value="' +
          line.qty +
          '"/></td>' +
          '<td>' +
          formatPrice(lineTotal, p.currency) +
          '</td>' +
          '<td><button type="button" class="link-btn cart-remove" data-id="' +
          escapeHtml(p.id) +
          '">Remove</button></td>';
        tbody.appendChild(tr);
      });
      if (!cart.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cart">Your cart is empty. <a href="catalog.html">Continue shopping</a></td></tr>';
      }
      if (subEl) subEl.textContent = formatPrice(subtotal, 'EUR');

      tbody.addEventListener('change', function (e) {
        var inp = e.target.closest('.cart-qty');
        if (!inp) return;
        var id = inp.getAttribute('data-id');
        var v = parseInt(inp.value, 10);
        if (v <= 0) removeLine(id);
        else updateLine(id, v);
        initCart();
      });
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest('.cart-remove');
        if (!btn) return;
        removeLine(btn.getAttribute('data-id'));
        initCart();
      });
    });
  }

  global.NordstrandShop = {
    getCart: getCart,
    addToCart: addToCart,
    formatPrice: formatPrice,
    initHome: initHome,
    initDeals: initDeals,
    initCatalog: initCatalog,
    initProduct: initProduct,
    initCart: initCart,
  };
})(window);
