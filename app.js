const PRODUCTS = [
  { id: 1, name: "Audífonos inalámbricos", category: "Electrónica", price: 39.99, rating: 4.5, emoji: "🎧" },
  { id: 2, name: "Reloj inteligente", category: "Electrónica", price: 89.0, rating: 4.3, emoji: "⌚" },
  { id: 3, name: "Cámara instantánea", category: "Electrónica", price: 64.5, rating: 4.1, emoji: "📷" },
  { id: 4, name: "Laptop ultraligera", category: "Electrónica", price: 749.0, rating: 4.7, emoji: "💻" },
  { id: 5, name: "Camiseta básica", category: "Ropa", price: 12.99, rating: 4.0, emoji: "👕" },
  { id: 6, name: "Jeans clásicos", category: "Ropa", price: 34.9, rating: 4.2, emoji: "👖" },
  { id: 7, name: "Tenis deportivos", category: "Ropa", price: 59.99, rating: 4.6, emoji: "👟" },
  { id: 8, name: "Gorra urbana", category: "Ropa", price: 15.0, rating: 3.9, emoji: "🧢" },
  { id: 9, name: "Cafetera de goteo", category: "Hogar", price: 45.0, rating: 4.4, emoji: "☕" },
  { id: 10, name: "Lámpara de escritorio", category: "Hogar", price: 22.5, rating: 4.1, emoji: "💡" },
  { id: 11, name: "Planta decorativa", category: "Hogar", price: 18.0, rating: 4.8, emoji: "🪴" },
  { id: 12, name: "Juego de sartenes", category: "Hogar", price: 54.99, rating: 4.3, emoji: "🍳" },
  { id: 13, name: "Balón de fútbol", category: "Deportes", price: 24.99, rating: 4.5, emoji: "⚽" },
  { id: 14, name: "Bicicleta de montaña", category: "Deportes", price: 329.0, rating: 4.6, emoji: "🚲" },
  { id: 15, name: "Pesas ajustables", category: "Deportes", price: 79.0, rating: 4.4, emoji: "🏋️" },
  { id: 16, name: "Libro: Aprende Python", category: "Libros", price: 27.5, rating: 4.9, emoji: "📘" },
  { id: 17, name: "Novela de misterio", category: "Libros", price: 14.99, rating: 4.2, emoji: "📕" },
  { id: 18, name: "Cuaderno de notas", category: "Libros", price: 6.5, rating: 4.0, emoji: "📓" },
];

const FREE_SHIPPING_MIN = 50;
const SHIPPING_COST = 4.99;
const CART_KEY = "marcketplace-cart";

const state = {
  query: "",
  category: "Todos",
  sort: "relevancia",
  cart: loadCart(),
};

const $ = (sel) => document.querySelector(sel);
const money = (n) => `$${n.toFixed(2)}`;
const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function renderCategories() {
  const cats = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
  $("#categories").innerHTML = cats
    .map((c) => `<button class="chip ${c === state.category ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.filter(
    (p) =>
      (state.category === "Todos" || p.category === state.category) &&
      (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  );
  if (state.sort === "precio-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "precio-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  return list;
}

function renderProducts() {
  const list = visibleProducts();
  $("#empty").hidden = list.length > 0;
  $("#grid").innerHTML = list
    .map(
      (p) => `
      <article class="card">
        <div class="thumb">${p.emoji}</div>
        <div class="card-body">
          <span class="cat">${p.category}</span>
          <h3>${p.name}</h3>
          <span class="rating" title="${p.rating} de 5">${stars(p.rating)} <small>${p.rating}</small></span>
          <span class="price">${money(p.price)}</span>
          <button class="primary" data-add="${p.id}">Agregar al carrito</button>
        </div>
      </article>`
    )
    .join("");
}

function cartTotals() {
  const subtotal = Object.entries(state.cart).reduce(
    (sum, [id, qty]) => sum + PRODUCTS.find((p) => p.id === +id).price * qty,
    0
  );
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  const entries = Object.entries(state.cart);
  $("#cart-count").textContent = entries.reduce((n, [, q]) => n + q, 0);
  $("#cart-items").innerHTML = entries.length
    ? entries
        .map(([id, qty]) => {
          const p = PRODUCTS.find((x) => x.id === +id);
          return `
          <li>
            <span class="emoji">${p.emoji}</span>
            <div class="info">
              <div class="name">${p.name}</div>
              <div class="unit">${money(p.price)} c/u</div>
            </div>
            <div class="qty">
              <button data-dec="${p.id}" aria-label="Quitar uno">−</button>
              <span>${qty}</span>
              <button data-inc="${p.id}" aria-label="Agregar uno">+</button>
            </div>
          </li>`;
        })
        .join("")
    : `<li class="cart-empty">Tu carrito está vacío.</li>`;
  const { subtotal, shipping, total } = cartTotals();
  $("#subtotal").textContent = money(subtotal);
  $("#shipping").textContent = shipping === 0 && subtotal > 0 ? "Gratis" : money(shipping);
  $("#total").textContent = money(total);
  $("#checkout").disabled = entries.length === 0;
}

function changeQty(id, delta) {
  const qty = (state.cart[id] || 0) + delta;
  if (qty <= 0) delete state.cart[id];
  else state.cart[id] = qty;
  saveCart();
  renderCart();
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.hidden = true), 2200);
}

function setCartOpen(open) {
  $("#cart").classList.toggle("open", open);
  $("#cart").setAttribute("aria-hidden", String(!open));
  $("#overlay").hidden = !open;
}

$("#search").addEventListener("input", (e) => {
  state.query = e.target.value;
  renderProducts();
});

$("#sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});

$("#categories").addEventListener("click", (e) => {
  const cat = e.target.dataset.cat;
  if (!cat) return;
  state.category = cat;
  renderCategories();
  renderProducts();
});

$("#grid").addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (!id) return;
  changeQty(+id, 1);
  toast(`${PRODUCTS.find((p) => p.id === +id).name} agregado al carrito`);
});

$("#cart-items").addEventListener("click", (e) => {
  if (e.target.dataset.inc) changeQty(+e.target.dataset.inc, 1);
  if (e.target.dataset.dec) changeQty(+e.target.dataset.dec, -1);
});

$("#cart-btn").addEventListener("click", () => setCartOpen(true));
$("#cart-close").addEventListener("click", () => setCartOpen(false));
$("#overlay").addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setCartOpen(false));

$("#checkout").addEventListener("click", () => {
  const { total } = cartTotals();
  state.cart = {};
  saveCart();
  renderCart();
  setCartOpen(false);
  toast(`¡Gracias por tu compra! Total pagado: ${money(total)}`);
});

$("#year").textContent = new Date().getFullYear();
renderCategories();
renderProducts();
renderCart();
