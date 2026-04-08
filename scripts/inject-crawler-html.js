/**
 * Injects static product HTML from products.json for crawlers (no JS).
 * Idempotent: START/END markers are preserved. Run: npm run inject
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const productsPath = path.join(ROOT, 'products.json');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function cardHtml(p) {
  const href = `product.html?id=${encodeURIComponent(p.id)}`;
  const img = escapeHtml(p.image || '');
  const title = escapeHtml(p.title);
  const price = escapeHtml(`${p.price} ${p.currency || 'EUR'}`);
  return (
    `<article class="p-card crawl-static-card">` +
    `<a href="${href}" class="p-card-img-wrap">` +
    `<img src="${img}" alt="${title}" width="400" height="400" loading="lazy"/>` +
    `</a>` +
    `<div class="p-card-body">` +
    `<a href="${href}" class="p-card-title">${title}</a>` +
    `<div class="p-card-price">${price}</div>` +
    `</div></article>`
  );
}

function dealCardHtml(p) {
  const href = `product.html?id=${encodeURIComponent(p.id)}`;
  const title = escapeHtml(p.title);
  const short =
    p.title.length > 40 ? `${escapeHtml(p.title.slice(0, 40))}…` : title;
  const sale = (p.price * 0.85).toFixed(2);
  const cur = escapeHtml(`${sale} ${p.currency || 'EUR'}`);
  const was = escapeHtml(`${p.price} ${p.currency || 'EUR'}`);
  const img = escapeHtml(p.image || '');
  return (
    `<div class="deal-card crawl-static-deal">` +
    `<a href="${href}">` +
    `<img src="${img}" alt="${title}" width="200" height="200" loading="lazy"/>` +
    `</a>` +
    `<a href="${href}" class="deal-title">${short}</a>` +
    `<div class="deal-price">${cur} <s class="deal-was">${was}</s></div>` +
    `</div>`
  );
}

function productListHtml(products) {
  return products
    .map((p) => {
      const href = `product.html?id=${encodeURIComponent(p.id)}`;
      return `<li><a href="${href}">${escapeHtml(p.title)}</a></li>`;
    })
    .join('\n');
}

function patchFile(fileName, pairs) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn('skip missing', fileName);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  let ok = true;
  for (const [re, replacement] of pairs) {
    if (!re.test(html)) {
      console.error('missing marker in', fileName);
      ok = false;
      break;
    }
    html = html.replace(re, replacement);
  }
  if (ok) fs.writeFileSync(filePath, html, 'utf8');
  console.log('inject:', fileName, ok ? 'ok' : 'FAILED');
}

function main() {
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  if (!Array.isArray(products) || !products.length) {
    console.error('No products in products.json');
    process.exit(1);
  }

  const grid = products.map(cardHtml).join('\n');
  const deals = products.slice(12, 18).map(dealCardHtml).join('\n');
  const list = productListHtml(products);

  patchFile('index.html', [
    [
      /<!--CRAWL_DEALS_START-->[\s\S]*?<!--CRAWL_DEALS_END-->/,
      `<!--CRAWL_DEALS_START-->${deals}<!--CRAWL_DEALS_END-->`,
    ],
    [
      /<!--CRAWL_GRID_START-->[\s\S]*?<!--CRAWL_GRID_END-->/,
      `<!--CRAWL_GRID_START-->${grid}<!--CRAWL_GRID_END-->`,
    ],
  ]);

  patchFile('catalog.html', [
    [
      /<!--CRAWL_CATALOG_START-->[\s\S]*?<!--CRAWL_CATALOG_END-->/,
      `<!--CRAWL_CATALOG_START-->${grid}<!--CRAWL_CATALOG_END-->`,
    ],
  ]);

  patchFile('product.html', [
    [
      /<!--CRAWL_PRODUCT_NS_START-->[\s\S]*?<!--CRAWL_PRODUCT_NS_END-->/,
      `<!--CRAWL_PRODUCT_NS_START-->${list}<!--CRAWL_PRODUCT_NS_END-->`,
    ],
  ]);
}

main();
