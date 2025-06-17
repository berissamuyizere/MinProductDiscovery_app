const productContainer = document.getElementById('productContainer');
const categoryContainer = document.getElementById('categoryContainer');
const searchInput = document.getElementById('searchInput');
let originalProducts = [];
let allProducts = [];
let likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
let compareList = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const perPage = 8;
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
  categoryContainer.innerHTML = `<button onclick="filterCategory(null)">All</button>`;
  categories.forEach(cat => {
    categoryContainer.innerHTML += `<button onclick="filterCategory('${cat}')">${cat}</button>`;
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

// const rate = document.getElementById('rating')
// rate.addEventListener(onclick, ()=>{
//   rating.style.backgroundColor = "blue"

// })

function renderComparison() {
  const compareItems = document.getElementById('compareItems');
  compareItems.innerHTML = '';
  compareList.forEach(id => {
    const product = originalProducts.find(p => p.id === id);
    const div = document.createElement('div');
    div.innerHTML = `<strong>${product.title}</strong><p>$${product.price}</p>`;
    compareItems.appendChild(div);
  });
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

// function generateComparisonTable(id) {
//    if (!compareList.includes(id)) {
// const tableBody = document.querySelector("#comparison-table tbody");
//     addToCompare.forEach(item => {
//         const row = document.createElement("tr");
//         const featureCell = document.createElement("td");
//         featureCell.textContent = item.feature;
//         row.appendChild(featureCell);

//         for (const key in item) {
//             if (key !== "feature") {
//                 const productCell = document.createElement("td");
//                 productCell.textContent = item[key];
//                 row.appendChild(productCell);
//             }
//         }
//         tableBody.appendChild(row);
//     });
// }
//     compareList.push(id);
//   }
//   renderComparison();

//     
// generateComparisonTable();
