const productContainer = document.getElementById('productContainer');
const categoryContainer = document.getElementById('categoryContainer');
const searchInput = document.getElementById('searchInput');
let originalProducts = [];
let allProducts = [];
let likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
let compareList = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const perPage = 13;

async function fetchProducts() {
  const response = await fetch('https://fakestoreapi.com/products');
  const data = await response.json();
  originalProducts = data;
  allProducts = [...originalProducts];
  displayCategories(originalProducts);
  displayProducts(allProducts);
}

function displayCategories(products) {
  const categories = [...new Set(products.map(p => p.category))];
  categoryContainer.innerHTML = '';
  // "All" button
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => filterCategory(null));
  categoryContainer.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.addEventListener('click', () => filterCategory(cat));
    categoryContainer.appendChild(btn);
  });
}
function filterCategory(category) {
  currentPage = 1;
  allProducts = category
    ? originalProducts.filter(p => p.category === category)
    : [...originalProducts];
  displayProducts(allProducts);
}

function displayProducts(products) {
  productContainer.innerHTML = '';
  const start = (currentPage - 1) * perPage;
  const paginated = products.slice(start, start + perPage);
  paginated.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h4>${product.title}</h4>
      <div class= "productRating">
      <p><i class="fas fa-dollar-sign"></i> ${product.price}</p>
      <p><i class="fas fa-star" id = "rating"></i> ${product.rating.rate} (${product.rating.count})</p>
      </div>
      <p>${product.description.slice(0, 60)}...</p>
      <p class="likes" onclick="toggleLike(${product.id})">
        <i class="${likedProducts.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
      </p>
      <div class = "buttons">
      <button class="compare-btn" onclick="addToCompare(${product.id})">
        <i class="fas fa-balance-scale"></i> Compare
      </button>
      <button class="cart-btn" onclick="addToCart(${product.id})">
        <i class="fas fa-cart-plus"></i> Add to Cart
      </button>
      </div>
    `;

    productContainer.appendChild(div);
  });
  renderPagination(products.length);
}
function toggleLike(id) {
  const index = likedProducts.indexOf(id);
  if (index === -1) {
    likedProducts.push(id);
  } else {
    likedProducts.splice(index, 1);
  }
  localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
  displayProducts(allProducts);
}
function addToCompare(id) {
  if (!compareList.includes(id)) {
    compareList.push(id);
  }
  renderComparison();
}

function renderComparison() {
  const compareItems = document.getElementById('compareItems');
  compareItems.innerHTML = '';

  if (compareList.length === 0) {
    compareItems.style.display = 'none';
    return;
  }

  compareItems.style.display = '';

  // --- Comparison Header (optional, can style as you wish) ---
  const headerDiv = document.createElement('div');
  headerDiv.className = 'compare-header';
  headerDiv.innerHTML = `
    <span class="compare-icon">🔍</span>
    <span class="compare-title">Product Comparison</span>
  `;
  compareItems.appendChild(headerDiv);

  // --- Comparison Table ---
  const products = compareList.map(id => originalProducts.find(p => p.id === id));
  const table = document.createElement('table');
  table.className = 'comparison-table';
  // Header row: image + title
  const headerRow = document.createElement('tr');
  products.forEach(p => {
    const th = document.createElement('th');
    th.innerHTML = ` <img src="${p.image}" alt="${p.title}" class="compare-img"><br> ${p.title}</div>`;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Price row
  const priceRow = document.createElement('tr');
  products.forEach(p => {
    const td = document.createElement('td');
    td.innerHTML = `<span class="compare-price">$${p.price}</span>`;
    priceRow.appendChild(td);
  });
  table.appendChild(priceRow);

  compareItems.appendChild(table);

  // --- Clear Button BELOW the table ---
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear Comparison';
  clearBtn.className = 'clear-compare-btn';
  clearBtn.onclick = function() {
    compareList = [];
    renderComparison();
  };
  compareItems.appendChild(clearBtn);
}
function addToCart(id) {
  const product = originalProducts.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.title} added to cart!`);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / perPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.style.backgroundColor = '#003eaa';
    btn.onclick = () => {
      currentPage = i;
      displayProducts(allProducts);
    };
    pagination.appendChild(btn);
  }
}
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = originalProducts.filter(
    p =>
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
  );
  allProducts = filtered;
  currentPage = 1;
  displayProducts(filtered);
});
fetchProducts();

// --- Cart and Liked Section Logic ---

// Add control buttons above the grid
window.addEventListener('DOMContentLoaded', () => {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'products-controls';

  const viewCartBtn = document.createElement('button');
  viewCartBtn.textContent = "View Cart";
  viewCartBtn.className = "cart-btn";
  viewCartBtn.onclick = showCartSection;

  const viewLikedBtn = document.createElement('button');
  viewLikedBtn.textContent = "View Liked Items";
  viewLikedBtn.className = "compare-btn";
  viewLikedBtn.onclick = showLikedSection;

  controlsContainer.appendChild(viewCartBtn);
  controlsContainer.appendChild(viewLikedBtn);

  // Insert above products grid
  const productGrid = document.getElementById('productContainer');
  productGrid.parentNode.insertBefore(controlsContainer, productGrid);
});

// --- Show/Hide Cart/Liked Sections (one at a time) ---
function showCartSection() {
  renderCart();
  document.getElementById('cartContainer').style.display = 'block';
  document.getElementById('likedContainer').style.display = 'none';
}
function showLikedSection() {
  renderLiked();
  document.getElementById('likedContainer').style.display = 'block';
  document.getElementById('cartContainer').style.display = 'none';
}

// --- Render Cart Section ---
function renderCart() {
  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = '';
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'cart-table';
  table.innerHTML = `
    <tr><th>Image</th><th>Title</th><th>Price</th><th>Qty</th><th>Remove</th></tr>
  `;
  cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${item.image}" style="width:40px;height:40px;"></td>
      <td>${item.title}</td>
      <td>$${item.price}</td>
      <td>${item.qty}</td>
      <td><button onclick="removeFromCart(${item.id})">Remove</button></td>
    `;
    table.appendChild(row);
  });
  cartContainer.appendChild(table);

  // Cart total
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalDiv = document.createElement('div');
  totalDiv.className = "cart-total";
  totalDiv.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
  cartContainer.appendChild(totalDiv);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = "Close Cart";
  closeBtn.className = "close-section-btn";
  closeBtn.onclick = () => { cartContainer.style.display = "none"; };
  cartContainer.appendChild(closeBtn);
}

// --- Remove from cart + update UI ---
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

// --- Render Liked Items Section ---
function renderLiked() {
  const likedContainer = document.getElementById('likedContainer');
  likedContainer.innerHTML = '';
  if (likedProducts.length === 0) {
    likedContainer.innerHTML = '<p>You have no liked items.</p>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'cart-table';
  table.innerHTML = `
    <tr><th>Image</th><th>Title</th><th>Price</th><th>Unlike</th></tr>
  `;
  likedProducts.forEach(id => {
    const product = originalProducts.find(p => p.id === id);
    if (!product) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${product.image}" style="width:40px;height:40px;"></td>
      <td>${product.title}</td>
      <td>$${product.price}</td>
      <td><button onclick="toggleLike(${product.id}); renderLiked();">Unlike</button></td>
    `;
    table.appendChild(row);
  });
  likedContainer.appendChild(table);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = "Close Liked Items";
  closeBtn.className = "close-section-btn";
  closeBtn.onclick = () => { likedContainer.style.display = "none"; };
  likedContainer.appendChild(closeBtn);
}