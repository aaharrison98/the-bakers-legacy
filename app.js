// --- BAKERY PRODUCT DATABASE ---
const products = [
  {
    id: 'lemon-cake',
    title: 'Lemon Sponge Cake',
    description: 'Light, zesty sponge cake finished with a sweet lemon drizzle glaze.',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=600',
    options: [
      { id: 'dozen', label: 'A Dozen (Slices)', price: 28.00 },
      { id: 'whole-pan', label: 'Whole Pan', price: 48.00 }
    ]
  },
  {
    id: 'choc-chip-cookies',
    title: 'Chocolate Chip Cookies',
    description: 'Golden edges, soft buttery centers, packed with semi-sweet chocolate chunks.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=600',
    options: [
      { id: 'dozen', label: 'A Dozen', price: 22.00 },
      { id: 'whole-pan', label: 'Whole Pan Batch', price: 40.00 }
    ]
  },
  {
    id: 'choc-brownies',
    title: 'Chocolate Fudge Brownies',
    description: 'Dense, rich chocolate fudge brownies with a crinkly glossy top.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    options: [
      { id: 'dozen', label: 'A Dozen Squares', price: 26.00 },
      { id: 'whole-pan', label: 'Whole Pan', price: 46.00 }
    ]
  },
  {
    id: 'sample-box',
    title: "The Legacy Sample Box",
    description: 'The ultimate sampler box including 3 lemon cake slices, 3 cookies, and 3 brownies.',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=600',
    options: [
      { id: 'sample', label: 'Fixed Sample Box', price: 34.00 }
    ]
  }
];

// Active user selection states for products
const selectedOptionsState = {
  'lemon-cake': 'dozen',
  'choc-chip-cookies': 'dozen',
  'choc-brownies': 'dozen',
  'sample-box': 'sample'
};

// Shopping cart state array
let cart = [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
});

// Navigation Controller
function navigateTo(pageId) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    const activeNav = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (pageId === 'checkout') {
    renderCheckoutSummary();
  }
}

// Render Products Grid
function renderProducts() {
  const mainGrid = document.getElementById('mainProductGrid');
  const featuredGrid = document.getElementById('featuredProductGrid');

  if (mainGrid) mainGrid.innerHTML = products.map(p => createProductCardHTML(p)).join('');
  if (featuredGrid) featuredGrid.innerHTML = products.slice(0, 3).map(p => createProductCardHTML(p)).join('');
}

function createProductCardHTML(product) {
  const activeOptId = selectedOptionsState[product.id];
  const activeOption = product.options.find(o => o.id === activeOptId) || product.options[0];
  const hasMultipleOptions = product.options.length > 1;

  return `
    <div class="product-card">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-description">${product.description}</p>
        
        ${hasMultipleOptions ? `
          <div class="size-selector">
            ${product.options.map(opt => `
              <button class="size-btn ${opt.id === activeOptId ? 'active' : ''}" 
                      onclick="selectProductOption('${product.id}', '${opt.id}')">
                ${opt.label}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <div class="product-bottom">
          <span class="product-price" id="price-${product.id}">$${activeOption.price.toFixed(2)}</span>
          <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

function selectProductOption(productId, optionId) {
  selectedOptionsState[productId] = optionId;
  renderProducts();
}

// --- CART MANAGEMENT ---
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const selectedOptId = selectedOptionsState[productId];
  const option = product.options.find(o => o.id === selectedOptId);

  const existingItemIndex = cart.findIndex(item => item.id === productId && item.optionId === selectedOptId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      optionId: option.id,
      optionLabel: option.label,
      price: option.price,
      quantity: 1
    });
  }

  updateCartUI();
  showToast(`${product.title} (${option.label}) added!`);
}

function updateCartQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
  if (document.getElementById('checkout').classList.contains('active')) {
    renderCheckoutSummary();
  }
}

function updateCartUI() {
  const cartBadge = document.getElementById('cartBadge');
  const cartBody = document.getElementById('cartBody');
  const cartDrawerSubtotal = document.getElementById('cartDrawerSubtotal');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartBadge.textContent = totalItems;
  cartDrawerSubtotal.textContent = `$${subtotal.toFixed(2)}`;

  if (cart.length === 0) {
    cartBody.innerHTML = `<p style="text-align: center; color: #888; margin-top: 2rem;">Your cart is empty.</p>`;
  } else {
    cartBody.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div>
          <h4 style="font-size: 0.95rem;">${item.title}</h4>
          <span style="font-size: 0.8rem; color: #666;">${item.optionLabel} - $${item.price.toFixed(2)}</span>
          <div style="margin-top: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
            <button onclick="updateCartQuantity(${index}, -1)" style="padding: 0 6px;">-</button>
            <span style="font-size: 0.85rem;">${item.quantity}</span>
            <button onclick="updateCartQuantity(${index}, 1)" style="padding: 0 6px;">+</button>
          </div>
        </div>
        <div style="font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');
  }
}

function toggleCart(open) {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  if (open) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  } else {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
}

function goToCheckout() {
  toggleCart(false);
  navigateTo('checkout');
}

// --- CHECKOUT & FORMS ---
function renderCheckoutSummary() {
  const summaryList = document.getElementById('checkoutSummaryList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const taxEl = document.getElementById('checkoutTax');
  const totalEl = document.getElementById('checkoutTotal');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  if (cart.length === 0) {
    summaryList.innerHTML = '<p style="color: #777;">No items in cart.</p>';
    return;
  }

  summaryList.innerHTML = cart.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
      <div>
        <div style="font-weight: 600;">${item.title} (x${item.quantity})</div>
        <div style="font-size: 0.8rem; color: #666;">${item.optionLabel}</div>
      </div>
      <div>$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  alert('Thank you for your order! Your delicious treats will be prepared shortly.');
  cart = [];
  updateCartUI();
  navigateTo('home');
}

function handleContactSubmit(event) {
  event.preventDefault();
  showToast('Thank you! Your message has been sent.');
  document.getElementById('contactForm').reset();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}