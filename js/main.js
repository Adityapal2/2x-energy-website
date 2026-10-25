(function () {
  'use strict';

  // Fallback defaults in case SITE_CONFIG or PRODUCTS are not defined globally
  const CONFIG = window.SITE_CONFIG || {
    storeName: '2X Energy',
    whatsappNumber: '',
    upiId: '9811937877@axl',
    phoneDisplay: '',
    phoneLink: '',
    businessEmail: '',
    businessAddress: '',
    domain: ''
  };

  const PRODUCTS = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const CART_KEY = '2x-energy-cart-v1';
  const CART_UPDATED_KEY = `${CART_KEY}-updated`;
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function productById(id) {
    return PRODUCTS.find((product) => String(product.id) === String(id));
  }

  function cleanCartItems(items) {
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => item && productById(item.id) && Number.isFinite(Number(item.qty)) && Number(item.qty) > 0)
      .map((item) => ({ id: String(item.id), qty: Math.min(50, Math.max(1, Math.floor(Number(item.qty)))) }));
  }

  function getCart() {
    let stored = null;
    let storedAt = 0;
    let storageAvailable = true;

    try {
      const raw = window.localStorage.getItem(CART_KEY);
      stored = raw ? cleanCartItems(JSON.parse(raw)) : null;
      storedAt = Number(window.localStorage.getItem(CART_UPDATED_KEY) || 0);
    } catch (error) {
      storageAvailable = false;
    }

    if (window.location.protocol === 'file:') {
      const params = new URLSearchParams(window.location.search);
      const snapshotText = params.get('cart');
      const snapshotTime = Number(params.get('cartTime') || 0);

      if (snapshotText) {
        try {
          const snapshot = cleanCartItems(JSON.parse(snapshotText));
          if (!stored || snapshotTime > storedAt) {
            try {
              window.localStorage.setItem(CART_KEY, JSON.stringify(snapshot));
              window.localStorage.setItem(CART_UPDATED_KEY, String(snapshotTime || Date.now()));
            } catch (error) { /* Fallback remains available */ }
            window.__2xCartFallback = snapshot;
            return snapshot;
          }
        } catch (error) { /* Ignore malformed cart data */ }
      }
    }

    if (stored !== null) return stored;
    if (!storageAvailable || window.location.protocol === 'file:') {
      return Array.isArray(window.__2xCartFallback) ? cleanCartItems(window.__2xCartFallback) : [];
    }
    return [];
  }

  function syncFileCartLinks(cart, updatedAt) {
    if (window.location.protocol !== 'file:') return;
    const cartText = JSON.stringify(cart);
    $$('a[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) return;
      try {
        const url = new URL(link.href, window.location.href);
        if (url.protocol !== 'file:') return;
        url.searchParams.set('cart', cartText);
        url.searchParams.set('cartTime', String(updatedAt));
        link.href = url.href;
      } catch (error) { /* Leave link unchanged */ }
    });
  }

  function saveCart(cart) {
    const clean = cleanCartItems(
      cart
        .filter((item) => item && item.qty > 0)
        .map((item) => ({ id: String(item.id), qty: Math.min(50, Math.max(1, Math.floor(Number(item.qty) || 1))) }))
    );
    const updatedAt = Date.now();
    window.__2xCartFallback = clean;

    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(clean));
      window.localStorage.setItem(CART_UPDATED_KEY, String(updatedAt));
    } catch (error) { /* Local storage fallback handles this */ }

    syncFileCartLinks(clean, updatedAt);
    updateCartCount();
    return clean;
  }

  function cartCount(cart = getCart()) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartSubtotal(cart = getCart()) {
    return cart.reduce((sum, item) => {
      const product = productById(item.id);
      return sum + (product ? Number(product.price || 0) * item.qty : 0);
    }, 0);
  }

  function addToCart(productId, quantity = 1) {
    const product = productById(productId);
    if (!product) return;
    const cart = getCart();
    const qty = Math.min(50, Math.max(1, Math.floor(Number(quantity) || 1)));
    const existing = cart.find((item) => String(item.id) === String(productId));

    if (existing) {
      existing.qty = Math.min(50, existing.qty + qty);
    } else {
      cart.push({ id: String(productId), qty });
    }

    saveCart(cart);
    showToast(`${product.name} added to cart`);
  }

  function updateCartQuantity(productId, quantity) {
    const qty = Math.min(50, Math.max(1, Math.floor(Number(quantity) || 1)));
    const cart = getCart().map((item) => String(item.id) === String(productId) ? { ...item, qty } : item);
    saveCart(cart);
    renderCartPage();
  }

  function removeFromCart(productId) {
    saveCart(getCart().filter((item) => String(item.id) !== String(productId)));
    renderCartPage();
    showToast('Item removed from cart');
  }

  function whatsappUrl(message) {
    const number = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function openWhatsApp(message) {
    const number = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    if (!number) {
      showToast('Please add the business WhatsApp number in js/products.js first.');
      return;
    }
    const url = whatsappUrl(message);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.opener = null;
    } else {
      window.location.href = url;
    }
  }

  function getProductEnquiryMessage(product, quantity = 1) {
    return [
      `Hello ${CONFIG.storeName || '2X Energy'}, I would like to enquire about this battery.`,
      `Product: ${product.name}`,
      `Voltage: ${product.voltage} | Capacity: ${product.capacity}`,
      `Catalogue power-column value (unit to confirm): ${product.power}`,
      `Listed price: ${money.format(product.price)} per unit`,
      `Quantity: ${quantity}`,
      'Please confirm current price, availability, compatibility, delivery charges and any bulk pricing.',
      `Product page: ${CONFIG.domain || ''}/product.html?id=${encodeURIComponent(product.id)}`
    ].join('\n');
  }

  function renderHeaderFooter() {
    const headerRoot = $('#site-header');
    const footerRoot = $('#site-footer');
    const page = document.body.dataset.page || '';
    const navItems = [
      ['home', 'Home', 'index.html'],
      ['shop', 'Manufacturer', 'shop.html'],
      ['about', 'About', 'about.html'],
      ['contact', 'Contact', 'contact.html']
    ];

    const navMarkup = navItems.map(([key, label, href]) => {
      const current = page === key || (page === 'product' && key === 'shop') || (page === 'cart' && key === 'shop') ? ' aria-current="page"' : '';
      return `<a class="nav-link" href="${href}"${current}>${label}</a>`;
    }).join('');

    const cleanWhatsappNum = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');

    if (headerRoot) {
      headerRoot.innerHTML = `
        <div class="announcement-bar"><div class="section-wrap announcement-inner"><span><i aria-hidden="true"></i> 2X ENERGY BATTERIES MANUFACTURER</span><span class="announcement-note">Retail & wholesale enquiries · Greater Noida, India</span></div></div>
        <header class="site-header">
          <div class="section-wrap header-inner">
            <a class="brand" href="index.html" aria-label="2X Energy Batteries Manufacturer home"><img src="images/2x-energy-logo.svg" alt="2X Energy Batteries Manufacturer logo" width="210" height="45"></a>
            <form class="header-search" id="site-search-form" action="shop.html" role="search"><label class="sr-only" for="site-search-input">Search batteries</label><input id="site-search-input" name="q" type="search" placeholder="Search voltage, capacity and batteries…" autocomplete="off"><button type="submit" aria-label="Search products"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button></form>
            <nav class="desktop-nav" aria-label="Main navigation">${navMarkup}</nav>
            <div class="header-actions">
              <a class="cart-link" href="cart.html" aria-label="Cart, ${cartCount()} items"><svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span class="cart-word">Cart</span><span class="cart-count" id="header-cart-count">${cartCount()}</span></a>
              <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
            </div>
          </div>
          <div class="category-nav-wrap"><nav class="section-wrap category-nav" aria-label="Battery categories"><a href="shop.html">All batteries</a><a href="shop.html?q=48V">48V batteries</a><a href="shop.html?q=60V">60V batteries</a><a href="shop.html?q=72V">72V batteries</a><a href="contact.html?topic=E-bike%20and%20e-scooter%20battery%20enquiry">E-bike & scooter</a><a href="contact.html?topic=Solar%20energy%20storage%20enquiry">Solar storage</a><a href="contact.html?topic=Wholesale%20enquiry">Wholesale orders</a><a class="category-nav-chat" href="https://wa.me/${escapeHtml(cleanWhatsappNum)}" data-whatsapp-link>Chat with us ↗</a></nav></div>
          <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">${navMarkup}<a class="nav-link" href="cart.html">Your cart (${cartCount()})</a><a class="nav-link" href="contact.html?topic=Wholesale%20enquiry">Wholesale enquiries</a></nav>
        </header>`;

      const searchForm = $('#site-search-form', headerRoot);
      const toggle = $('.menu-toggle', headerRoot);
      const mobileNav = $('#mobile-nav', headerRoot);

      if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const query = ($('#site-search-input', searchForm)?.value || '').trim();
          window.location.href = `shop.html?q=${encodeURIComponent(query)}`;
        });
      }

      if (toggle && mobileNav) {
        toggle.addEventListener('click', () => {
          const isOpen = mobileNav.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', String(isOpen));
          toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
          const path = $('svg path', toggle);
          if (path) path.setAttribute('d', isOpen ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16');
        });
      }
    }

    if (footerRoot) {
      footerRoot.innerHTML = `
        <footer class="site-footer">
          <div class="section-wrap footer-main">
            <div class="footer-brand"><a class="brand footer-logo" href="index.html" aria-label="2X Energy Batteries Manufacturer home"><img src="images/2x-energy-logo-light.svg" alt="2X Energy Batteries Manufacturer logo" width="210" height="45"></a><p>Battery options for EV applications and energy storage. Browse listed configurations, compare prices and contact our team before ordering.</p><div class="footer-address"><b>Our address</b><span>${escapeHtml(CONFIG.businessAddress || '')}</span></div></div>
            <div class="footer-column"><h3>Explore</h3><div class="footer-links"><a href="shop.html">Shop batteries</a><a href="about.html">About 2X Energy</a><a href="contact.html">Contact us</a><a href="contact.html?topic=Wholesale%20enquiry">Wholesale enquiries</a><a href="cart.html">Your cart</a></div></div>
            <div class="footer-column"><h3>Get in touch</h3><div class="footer-links"><a href="https://wa.me/${escapeHtml(cleanWhatsappNum)}" data-whatsapp-link>WhatsApp: <span data-business-phone>${escapeHtml(CONFIG.phoneDisplay || 'Update contact number')}</span></a><a href="tel:${escapeHtml(CONFIG.phoneLink || '')}" data-phone-link>Call <span data-business-phone>${escapeHtml(CONFIG.phoneDisplay || 'Update contact number')}</span></a><span class="footer-contact-line" id="footer-email"><a href="mailto:${escapeHtml(CONFIG.businessEmail || '')}">${escapeHtml(CONFIG.businessEmail || '')}</a></span></div><div class="footer-location-note">Plot no 335, Block N, Village-Luksar, Gautam Budh Nagar, Greater Noida</div></div>
          </div>
          <div class="section-wrap footer-bottom"><span>© <span id="copyright-year"></span> 2X Energy Batteries Manufacturer. All rights reserved.</span><span class="footer-disclaimer">Catalogue prices and estimated ranges are indicative. Confirm fitment, current pricing, delivery and warranty details with the team.</span></div>
        </footer>
        <a class="whatsapp-float" href="https://wa.me/${escapeHtml(cleanWhatsappNum)}?text=${encodeURIComponent('Hello 2X Energy Batteries Manufacturer, I have a product enquiry.')}" target="_blank" rel="noopener noreferrer" aria-label="Chat with 2X Energy on WhatsApp" data-whatsapp-link><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C8.9 3 3.1 8.78 3.1 15.9c0 2.27.6 4.48 1.74 6.42L3 29l6.86-1.8a12.96 12.96 0 0 0 6.18 1.57h.01c7.12 0 12.92-5.79 12.93-12.91A12.86 12.86 0 0 0 25.2 6.7 12.85 12.85 0 0 0 16.04 3zm0 23.57h-.01c-1.93 0-3.82-.52-5.46-1.5l-.39-.23-4.07 1.07 1.09-3.97-.25-.41a10.7 10.7 0 0 1-1.64-5.63c0-5.88 4.8-10.67 10.71-10.67a10.6 10.6 0 0 1 7.56 3.13 10.6 10.6 0 0 1 3.13 7.57c-.01 5.88-4.8 10.64-10.67 10.64zm5.86-7.99c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.22.32-.83 1.05-1.02 1.27-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.85-1.61-1.9-1.8-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.38.49-.57.16-.19.22-.32.32-.54.11-.22.06-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56l-.62-.01c-.22 0-.57.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.11 1.32 3.32c.16.22 2.28 3.48 5.53 4.88.77.33 1.37.53 1.84.68.77.25 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.54.27-.76.27-1.41.19-1.54-.08-.13-.3-.22-.62-.38z"/></svg><span>Chat on WhatsApp</span></a>`;

      const year = $('#copyright-year', footerRoot);
      if (year) year.textContent = String(new Date().getFullYear());
    }

    $$('[data-business-phone]').forEach((node) => { node.textContent = CONFIG.phoneDisplay || 'Add business phone in js/products.js'; });
    $$('[data-whatsapp-link]').forEach((link) => {
      const current = link.getAttribute('href') || 'https://wa.me/';
      if (!current.includes('?text=')) link.setAttribute('href', `https://wa.me/${cleanWhatsappNum}`);
    });
    $$('[data-phone-link]').forEach((link) => link.setAttribute('href', CONFIG.phoneLink ? `tel:${CONFIG.phoneLink}` : '#'));

    const footerEmail = $('#footer-email');
    if (footerEmail && CONFIG.businessEmail) footerEmail.innerHTML = `<a href="mailto:${escapeHtml(CONFIG.businessEmail)}">${escapeHtml(CONFIG.businessEmail)}</a>`;

    const emailDisplay = $('#business-email-display');
    const emailHelper = $('#business-email-helper');
    const emailCard = $('#email-contact-card');

    if (emailDisplay) emailDisplay.textContent = CONFIG.businessEmail || 'Email address to be added';
    if (emailHelper && CONFIG.businessEmail) emailHelper.textContent = 'Send an email ↗';
    if (emailCard && CONFIG.businessEmail) {
      emailCard.setAttribute('role', 'link');
      emailCard.setAttribute('tabindex', '0');
      emailCard.style.cursor = 'pointer';
      emailCard.addEventListener('click', () => { window.location.href = `mailto:${CONFIG.businessEmail}`; });
      emailCard.addEventListener('keydown', (event) => { if (event.key === 'Enter') window.location.href = `mailto:${CONFIG.businessEmail}`; });
    }

    updateCartCount();
  }

  function updateCartCount() {
    const count = cartCount();
    const badge = $('#header-cart-count');
    if (badge) badge.textContent = String(count);
    const link = $('.cart-link');
    if (link) link.setAttribute('aria-label', `Cart, ${count} ${count === 1 ? 'item' : 'items'}`);
  }

  function showToast(message) {
    let toast = $('#site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function productCard(product) {
    const badge = product.badge ? `<span class="product-card-badge">${escapeHtml(product.badge)}</span>` : '';
    return `
      <article class="product-card">
        <a class="product-card-image" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${escapeHtml(product.name)}">
          <img src="${escapeHtml(product.image)}" alt="2X Energy branded lithium battery pack for the ${escapeHtml(product.voltage)} ${escapeHtml(product.capacity)} configuration" loading="lazy" width="640" height="480">
          ${badge}
        </a>
        <div class="product-card-body">
          <span class="product-category">${escapeHtml(product.manufacturer || '2X Energy')} · ${escapeHtml(product.category)}</span>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
          <div class="product-spec-line"><span class="spec-chip">${escapeHtml(product.voltage)}</span><span class="spec-chip">${escapeHtml(product.capacity)}</span></div>
          <div class="product-card-price-row"><span class="product-price">${money.format(product.price)}</span><span class="product-price-note">listed price</span></div>
        </div>
        <div class="product-card-actions"><a class="btn btn-secondary" href="product.html?id=${encodeURIComponent(product.id)}">View details</a><button class="btn btn-primary" type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to cart</button></div>
      </article>`;
  }

  function renderFeaturedProducts() {
    const root = $('#featured-product-grid');
    if (!root) return;
    const featuredIds = ['ev-48v-22ah', 'ev-60v-30ah', 'ev-72v-45ah', 'ev-48v-38ah'];
    const featured = featuredIds.map(productById).filter(Boolean);
    root.innerHTML = featured.length ? featured.map(productCard).join('') : PRODUCTS.slice(0, 4).map(productCard).join('');
  }

  function renderShopPage() {
    const grid = $('#shop-product-grid');
    if (!grid) return;

    const searchInput = $('#product-search');
    const voltageFilter = $('#voltage-filter');
    const manufacturerFilter = $('#manufacturer-filter');
    const sortFilter = $('#sort-filter');
    const resultCount = $('#shop-results-count');
    const emptyState = $('#shop-empty-state');

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    const initialManufacturer = urlParams.get('manufacturer') || 'all';

    let filters = { search: initialQuery, manufacturer: initialManufacturer, voltage: 'all', sort: 'featured' };

    if (searchInput) searchInput.value = initialQuery;
    if (manufacturerFilter) manufacturerFilter.value = initialManufacturer;

    function paint() {
      const search = filters.search.trim().toLowerCase();
      let items = PRODUCTS.filter((product) => {
        const searchHaystack = `${product.name} ${product.manufacturer || ''} ${product.voltage} ${product.capacity} ${product.power} ${product.range}`.toLowerCase();
        return (!search || searchHaystack.includes(search)) &&
          (filters.manufacturer === 'all' || (product.manufacturer || '2X Energy') === filters.manufacturer) &&
          (filters.voltage === 'all' || product.voltage === filters.voltage);
      });

      if (filters.sort === 'price-low') items.sort((a, b) => a.price - b.price);
      if (filters.sort === 'price-high') items.sort((a, b) => b.price - a.price);
      if (filters.sort === 'capacity') items.sort((a, b) => parseInt(a.capacity, 10) - parseInt(b.capacity, 10));
      if (filters.sort === 'featured') items.sort((a, b) => PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b));

      grid.innerHTML = items.map(productCard).join('');
      if (resultCount) resultCount.textContent = `${items.length} ${items.length === 1 ? 'configuration' : 'configurations'} found`;
      if (emptyState) emptyState.hidden = items.length !== 0;
      grid.hidden = items.length === 0;
    }

    searchInput?.addEventListener('input', () => { filters.search = searchInput.value; paint(); });
    voltageFilter?.addEventListener('change', () => { filters.voltage = voltageFilter.value; paint(); });
    manufacturerFilter?.addEventListener('change', () => { filters.manufacturer = manufacturerFilter.value; paint(); });
    sortFilter?.addEventListener('change', () => { filters.sort = sortFilter.value; paint(); });

    function reset() {
      filters = { search: '', manufacturer: 'all', voltage: 'all', sort: 'featured' };
      if (searchInput) searchInput.value = '';
      if (manufacturerFilter) manufacturerFilter.value = 'all';
      if (voltageFilter) voltageFilter.value = 'all';
      if (sortFilter) sortFilter.value = 'featured';
      paint();
    }

    $('#clear-filters')?.addEventListener('click', reset);
    $('#empty-reset')?.addEventListener('click', reset);

    paint();
  }

  function renderProductPage() {
    const root = $('#product-detail-root');
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const product = productById(params.get('id')) || PRODUCTS[0];

    if (!product) {
      root.innerHTML = '<div class="empty-state"><h2>Product not found</h2><p>Please browse the catalogue and select a battery configuration.</p><a class="btn btn-primary" href="shop.html">Browse batteries</a></div>';
      return;
    }

    const title = `${product.name} | 2X Energy Batteries Manufacturer`;
    const description = `View the listed ${product.voltage} ${product.capacity} 2X Energy lithium LFP EV battery configuration, price and estimated range. Confirm compatibility before ordering.`;
    document.title = title;

    const metaDescription = $('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', description);

    const ogTitle = $('meta[property="og:title"]');
    const ogDescription = $('meta[property="og:description"]');
    const ogUrl = $('meta[property="og:url"]');

    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    if (ogUrl) ogUrl.setAttribute('content', `${CONFIG.domain || ''}/product.html?id=${encodeURIComponent(product.id)}`);

    const breadcrumb = $('#breadcrumb-product');
    if (breadcrumb) breadcrumb.textContent = product.name;

    root.innerHTML = `
      <div class="product-detail-visual"><img src="${escapeHtml(product.image)}" alt="2X Energy branded battery pack for the ${escapeHtml(product.voltage)} ${escapeHtml(product.capacity)} configuration" width="640" height="480"><span class="product-card-badge">${escapeHtml(product.category)}</span></div>
      <div class="product-detail-copy">
        <span class="product-category">${escapeHtml(product.category)} / LITHIUM LFP</span>
        <h1>${escapeHtml(product.name)}</h1>
        <div class="product-detail-price">${money.format(product.price)}</div><div class="price-caption">Listed catalogue price per unit · delivery charges confirmed separately</div>
        <p class="product-detail-description">${escapeHtml(product.description || '')}</p>
        <table class="spec-table" aria-label="Battery specifications"><tbody>
          <tr><th scope="row">Voltage</th><td>${escapeHtml(product.voltage)}</td></tr>
          <tr><th scope="row">Capacity</th><td>${escapeHtml(product.capacity)}</td></tr>
          <tr><th scope="row">Catalogue power-column value<br><small>Unit to confirm</small></th><td>${escapeHtml(product.power)}</td></tr>
          <tr><th scope="row">Estimated range</th><td>${escapeHtml(product.range)}</td></tr>
          <tr><th scope="row">Product category</th><td>${escapeHtml(product.category)}</td></tr>
        </tbody></table>
        <div class="quantity-picker"><label for="product-quantity">Quantity</label><div class="quantity-control"><button type="button" data-quantity-step="-1" aria-label="Decrease quantity">−</button><input id="product-quantity" type="number" min="1" max="50" value="1" inputmode="numeric"><button type="button" data-quantity-step="1" aria-label="Increase quantity">+</button></div></div>
        <div class="product-detail-actions"><button type="button" class="btn btn-primary" id="product-add-to-cart">Add to cart <span aria-hidden="true">＋</span></button><button type="button" class="btn btn-secondary" id="product-whatsapp-enquiry">Enquire on WhatsApp <span aria-hidden="true">↗</span></button></div>
        <p class="tiny-note" style="margin-top:14px">Before ordering: confirm vehicle compatibility, dimensions, connector, charger requirements, current price and availability with our team.</p>
      </div>`;

    $('#product-add-to-cart', root)?.addEventListener('click', () => addToCart(product.id, $('#product-quantity', root)?.value || 1));
    $('#product-whatsapp-enquiry', root)?.addEventListener('click', () => openWhatsApp(getProductEnquiryMessage(product, $('#product-quantity', root)?.value || 1)));

    $$('[data-quantity-step]', root).forEach((button) => button.addEventListener('click', () => {
      const input = $('#product-quantity', root);
      if (!input) return;
      const current = Math.max(1, Math.min(50, Number(input.value) || 1));
      input.value = String(Math.max(1, Math.min(50, current + Number(button.dataset.quantityStep))));
    }));
  }

  function loadQrCodeLibrary() {
  if (window.QRCode) return Promise.resolve(window.QRCode);
  if (window.__2xQrCodeLoading) return window.__2xQrCodeLoading;

  window.__2xQrCodeLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.async = true;
    script.onload = () => window.QRCode
      ? resolve(window.QRCode)
      : reject(new Error('QR library did not initialise'));
    script.onerror = () => reject(new Error('QR library could not load'));
    document.head.appendChild(script);
  });

  return window.__2xQrCodeLoading;
}


function renderUpiPaymentQr(total) {
  const qrContainer = $('#checkout-qr-code');
  const status = $('#checkout-qr-status');

  if (!qrContainer) return;

  qrContainer.replaceChildren();

  const upiId = String(CONFIG.upiId || '').trim();

  if (
    !upiId ||
    /YOUR[-_ ]?UPI[-_ ]?ID|yourupi@bank/i.test(upiId)
  ) {
    if (status) {
      status.textContent =
        'Business UPI ID configure nahi hai. Please verified UPI ID add karein.';
    }

    $$('.upi-app-btn').forEach(button => {
      button.disabled = true;
    });

    return;
  }

  const paymentUri = new URL('upi://pay');

  paymentUri.searchParams.set('pa', upiId);
  paymentUri.searchParams.set(
    'pn',
    String(CONFIG.storeName || '2X Energy')
  );
  paymentUri.searchParams.set('am', Number(total).toFixed(2));
  paymentUri.searchParams.set('cu', 'INR');
  paymentUri.searchParams.set('tn', '2X Energy cart order');

  const params = paymentUri.searchParams.toString();

  const appLinks = {
    phonepe: `phonepe://pay?${params}`,
    gpay: `gpay://upi/pay?${params}`,
    paytm: `paytmmp://pay?${params}`
  };

  $$('.upi-app-btn', $('#checkout-upi-form') || document)
    .forEach(button => {
      button.disabled = !(total > 0);

      button.onclick = () => {
        if (!(cartSubtotal(getCart()) > 0)) {
          showToast('Your cart is empty.');
          return;
        }

        const app = button.dataset.upiApp;

        if (appLinks[app]) {
          window.location.href = appLinks[app];
        }
      };
    });

  if (!(total > 0)) {
    if (status) {
      status.textContent = 'Cart total ₹0 se zyada hona chahiye.';
    }
    return;
  }

  if (status) {
    status.textContent = 'QR code load ho raha hai…';
  }

  loadQrCodeLibrary()
    .then(QRCode => {
      const container = $('#checkout-qr-code');

      if (!container) return;

      if (Math.abs(cartSubtotal(getCart()) - total) > 0.001) {
        renderCartPage();
        return;
      }

      container.replaceChildren();

      new QRCode(container, {
        text: paymentUri.toString(),
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.M
      });

      if (status) {
        status.textContent =
          'PhonePe, Google Pay ya kisi UPI app se QR scan karein. Payment se pehle payee aur amount verify karein.';
      }
    })
    .catch(() => {
      if (status) {
        status.textContent =
          'QR code load nahi hua. Internet check karke page reload karein.';
      }
    });
}



function renderCheckoutOptions(total) {
  const content = $('#cart-content');
  if (!content) return;

  let panel = $('#checkout-payment-options', content);

  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'checkout-payment-options';
    panel.style.cssText =
      'margin-top:24px;padding:22px;border:1px solid #dce4e8;border-radius:18px;background:#fff;';

    panel.innerHTML = `
      <h2>Payment Mode</h2>

      <div style="display:flex;flex-wrap:wrap;gap:12px;margin:16px 0;">
        <button type="button" class="btn btn-primary"
          id="checkout-select-cod">
          Cash on Delivery (COD)
        </button>

        <button type="button" class="btn btn-secondary"
          id="checkout-select-upi">
          UPI / QR Code
        </button>
      </div>

      <div id="checkout-cod-form" hidden>
        <h3>Delivery Details</h3>

        <form id="checkout-cod-details"
          style="display:grid;gap:12px;">

          <label>Full Name
            <input id="checkout-cod-name" name="name"
              type="text" autocomplete="name" required
              placeholder="Enter your name">
          </label>

          <label>Phone Number
            <input id="checkout-cod-phone" name="phone"
              type="tel" autocomplete="tel" required
              pattern="[0-9+() -]{10,18}"
              placeholder="Enter phone number">
          </label>

          <label>Delivery Address
            <textarea id="checkout-cod-address" name="address"
              autocomplete="street-address" required rows="3"
              placeholder="House no., street, city, state, PIN code"></textarea>
          </label>

          <button type="submit" class="btn btn-primary btn-full">
            Send Enquiry on WhatsApp
          </button>
        </form>
      </div>

      <div id="checkout-upi-form" hidden>
        <h3>UPI Payment</h3>

        <p>
          Order Amount:
          <strong id="checkout-qr-amount"></strong>
        </p>

        <div id="checkout-qr-code"
          style="display:flex;align-items:center;justify-content:center;
          width:240px;min-height:240px;max-width:100%;padding:10px;
          background:#f7f9fa;border-radius:12px;">
        </div>

        <p id="checkout-qr-status" role="status"></p>

      
<div class="upi-app-options">
  <button type="button" class="upi-app-btn" data-upi-app="phonepe">
    <img src="phonepe.jpg" alt="PhonePe logo">
    <span>PhonePe</span>
  </button>

  <button type="button" class="upi-app-btn" data-upi-app="gpay">
<img src="google pay.jpg" alt="Google Pay logo">
    <span>Google Pay</span>
  </button>

  <button type="button" class="upi-app-btn" data-upi-app="paytm">
   <img src="Paytm.jpg" alt="Paytm logo">
    <span>Paytm</span>
  </button>
</div>


        <form id="checkout-upi-details"
          style="display:grid;gap:12px;margin-top:18px;">

          <label>Full Name
            <input id="checkout-upi-name" name="name"
              type="text" autocomplete="name" required
              placeholder="Enter your name">
          </label>

          <label>Phone Number
            <input id="checkout-upi-phone" name="phone"
              type="tel" autocomplete="tel" required
              pattern="[0-9+() -]{10,18}"
              placeholder="Enter phone number">
          </label>

          <label>Delivery Address
            <textarea id="checkout-upi-address" name="address"
              autocomplete="street-address" required rows="3"
              placeholder="House no., street, city, state, PIN code"></textarea>
          </label>

          <label>UTR / Transaction ID
            <input id="checkout-upi-utr" name="paymentUtr"
              type="text" required
              placeholder="Enter UTR after payment">
          </label>

          <label>Payment Screenshot
            <input id="checkout-upi-screenshot"
              name="paymentScreenshot" type="file"
              accept="image/*" required>
          </label>

          <p style="font-size:13px;color:#52616b;">
            WhatsApp open hone ke baad payment screenshot manually attach karein.
          </p>

          <button type="submit" class="btn btn-primary btn-full">
            Send Enquiry on WhatsApp
          </button>
        </form>
      </div>
    `;

    content.appendChild(panel);

    const codButton = $('#checkout-select-cod', panel);
    const upiButton = $('#checkout-select-upi', panel);
    const codForm = $('#checkout-cod-form', panel);
    const upiForm = $('#checkout-upi-form', panel);

    function selectMode(mode) {
      const isCod = mode === 'cod';

      codForm.hidden = !isCod;
      upiForm.hidden = isCod;

      codButton.className =
        `btn ${isCod ? 'btn-primary' : 'btn-secondary'}`;

      upiButton.className =
        `btn ${isCod ? 'btn-secondary' : 'btn-primary'}`;

      if (!isCod) {
        const amount = cartSubtotal(getCart());

        $('#checkout-qr-amount', panel).textContent =
          money.format(amount);

        renderUpiPaymentQr(amount);
      }
    }

    codButton.addEventListener('click', () => selectMode('cod'));
    upiButton.addEventListener('click', () => selectMode('upi'));

    $('#checkout-cod-details', panel).addEventListener(
      'submit',
      event => submitCheckout(event, 'cod')
    );

    $('#checkout-upi-details', panel).addEventListener(
      'submit',
      event => submitCheckout(event, 'upi')
    );
  }

  panel.hidden = false;

  const amount = $('#checkout-qr-amount', panel);
  if (amount) amount.textContent = money.format(total);

  const oldForm = $('#checkout-form');
  if (oldForm) oldForm.style.display = 'none';

  ['#upi-payment-panel', '#upi-id-value', '#copy-upi-id'].forEach(
    selector => {
      const element = $(selector);

      if (element && !panel.contains(element)) {
        const wrapper = element.closest(
          '.upi-section, .upi-payment, .payment-section, .form-group'
        ) || element;

        if (!panel.contains(wrapper)) {
          wrapper.style.display = 'none';
        }
      }
    }
  );
}


function renderCartPage() {
  const content = $('#cart-content');
  const empty = $('#cart-empty');
  const list = $('#cart-items-list');
  const oldForm = $('#checkout-form');

  if (!content || !empty || !list) return;

  const cart = getCart();
  const cartLayout =
    $('.cart-layout') ||
    $('.cart-grid') ||
    content.closest('.section-wrap');

  if (!cart.length) {
    empty.hidden = false;
    content.hidden = true;

    if (oldForm) oldForm.hidden = true;

    const paymentPanel = $('#checkout-payment-options');
    if (paymentPanel) paymentPanel.hidden = true;

    if (cartLayout) cartLayout.style.display = 'none';

    $$('.cart-section, .cart-sidebar, .cart-summary, .cart-layout')
      .forEach((element) => {
        if (!element.contains(empty)) element.style.display = 'none';
      });

    return;
  }

  empty.hidden = true;
  content.hidden = false;

  if (oldForm) oldForm.style.display = 'none';

  if (cartLayout) cartLayout.style.display = '';

  $$('.cart-section, .cart-sidebar, .cart-summary, .cart-layout')
    .forEach((element) => {
      element.style.display = '';
    });

  list.innerHTML = cart.map((item) => {
    const product = productById(item.id);
    if (!product) return '';

    return `
      <article class="cart-item">
        <a href="product.html?id=${encodeURIComponent(product.id)}"
          class="cart-item-image">
          <img src="${escapeHtml(product.image)}"
            alt="${escapeHtml(product.name)}"
            loading="lazy" width="160" height="176">
        </a>

        <div class="cart-item-main">
          <div class="cart-item-head">
            <h3 class="cart-item-title">
              <a href="product.html?id=${encodeURIComponent(product.id)}">
                ${escapeHtml(product.name)}
              </a>
            </h3>
            <span class="cart-item-unit-price">
              ${money.format(product.price)}
            </span>
          </div>

          <div class="cart-item-meta">
            ${escapeHtml(product.voltage)} ·
            ${escapeHtml(product.capacity)} ·
            catalogue value ${escapeHtml(product.power)}
          </div>

          <div class="cart-item-controls">
            <label class="sr-only" for="qty-${escapeHtml(product.id)}">
              Quantity for ${escapeHtml(product.name)}
            </label>

            <input class="cart-quantity"
              id="qty-${escapeHtml(product.id)}"
              data-cart-quantity="${escapeHtml(product.id)}"
              type="number" min="1" max="50"
              value="${item.qty}" inputmode="numeric">

            <button class="remove-item" type="button"
              data-remove-cart-item="${escapeHtml(product.id)}">
              Remove
            </button>

            <span class="cart-item-subtotal">
              ${money.format(product.price * item.qty)}
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  const subtotal = cartSubtotal(cart);

  const subtotalElement = $('#cart-subtotal');
  const totalElement = $('#cart-total');

  if (subtotalElement) subtotalElement.textContent = money.format(subtotal);
  if (totalElement) totalElement.textContent = money.format(subtotal);

  renderCheckoutOptions(subtotal);
}

function submitCheckout(event, paymentMode) {
  event.preventDefault();

  const cart = getCart();

  if (!cart.length) {
    showToast('Your cart is empty.');
    return;
  }

  const mode = paymentMode;
  const prefix = mode === 'upi' ? 'checkout-upi-' : 'checkout-cod-';

  const name = $(`#${prefix}name`).value.trim();
  const phone = $(`#${prefix}phone`).value.trim();
  const address = $(`#${prefix}address`).value.trim();

  const utr = mode === 'upi'
    ? $('#checkout-upi-utr').value.trim()
    : 'Not applicable (COD)';

  const screenshot = mode === 'upi'
    ? $('#checkout-upi-screenshot').files[0]
    : null;

  if (!name || !phone || !address) {
    showToast('Please fill in all required details.');
    return;
  }

  if (mode === 'upi' && (!utr || !screenshot)) {
    showToast('Please enter your UTR and upload the payment screenshot.');
    return;
  }

  const productLines = cart.map((item) => {
    const product = productById(item.id);
    if (!product) return '';

    return `${product.name} (${product.voltage}, ${product.capacity}) x ${item.qty} = ${money.format(product.price * item.qty)}`;
  }).filter(Boolean);

  const subtotal = cartSubtotal(cart);

  const message = [
    `Hello ${CONFIG.storeName || '2X Energy'}, I want to submit my battery order enquiry.`,
    '',
    `Payment Mode: ${mode === 'cod' ? 'Cash on Delivery (COD)' : 'UPI'}`,
    '',
    'CUSTOMER DETAILS',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Delivery Address: ${address}`,
    '',
    'BATTERY DETAILS',
    ...productLines,
    '',
    `Items Subtotal: ${money.format(subtotal)}`,
    'Delivery Charges: Please confirm on WhatsApp.',
    `UTR / Transaction ID: ${utr}`,
    `Payment Screenshot: ${screenshot ? screenshot.name : 'Not applicable (COD)'}`,
    '',
    mode === 'upi'
      ? 'Please verify the payment and confirm my order. I will attach the screenshot in this WhatsApp chat.'
      : 'Please confirm my COD order, availability and delivery charges.'
  ].join('\n');

  openWhatsApp(message);
}

function setupCartPage() {
  const content = $('#cart-content');
  if (!content) return;

  renderCartPage();
}

  function addGlobalClickHandler() {
    document.addEventListener('click', (event) => {
      const addButton = event.target.closest('[data-add-to-cart]');
      if (addButton) {
        event.preventDefault();
        const productId = addButton.dataset.addToCart;
        addToCart(productId, 1);
        return;
      }

      const removeButton = event.target.closest('[data-remove-cart-item]');
      if (removeButton) {
        removeFromCart(removeButton.dataset.removeCartItem);
      }
    });

    document.addEventListener('change', (event) => {
      const quantityInput = event.target.closest('[data-cart-quantity]');
      if (quantityInput) updateCartQuantity(quantityInput.dataset.cartQuantity, quantityInput.value);
    });

    window.addEventListener('storage', (event) => {
      if (event.key === CART_KEY) {
        updateCartCount();
        if ($('#cart-items-list')) renderCartPage();
      }
    });
  }

  function init() {
    renderHeaderFooter();
    renderFeaturedProducts();
    renderShopPage();
    renderProductPage();
    setupCartPage();
    addGlobalClickHandler();
    updateCartCount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();