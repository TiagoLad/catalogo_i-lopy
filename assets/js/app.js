const WHATSAPP_NUMBER = "5515999999999";
const FAVORITES_KEY = "illopy-favorites";
const WHATSAPP_ICON = '<svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16.02 3.2A12.73 12.73 0 0 0 5.08 22.43L3.2 29l6.72-1.78A12.72 12.72 0 1 0 16.02 3.2Zm0 2.28a10.44 10.44 0 0 1 8.86 15.98 10.42 10.42 0 0 1-13.44 3.3l-.48-.28-3.98 1.05 1.07-3.87-.31-.5A10.44 10.44 0 0 1 16.02 5.48Zm-4.05 5.36c-.24 0-.62.09-.95.45-.33.36-1.25 1.22-1.25 2.97 0 1.75 1.28 3.45 1.46 3.69.18.24 2.47 3.95 6.12 5.38 3.03 1.19 3.65.95 4.31.89.66-.06 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.89-1.78-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69Z"/></svg>';

const state = {
  products: [],
  category: "Todos",
  filter: "todos",
  search: "",
  sort: "featured"
};

const categoryImages = {
  Todos: "images/produtos/Baby_Doll-Branco_P/1.jpeg",
  "Baby Doll": "images/produtos/Baby_Doll_Marsala_M/1.jpg",
  Conjuntos: "images/produtos/Baby_Doll_Preto_Vermelho_Renda_G/1.jpg",
  Pijamas: "images/produtos/Pijama_Americano_Verde_M/1.png",
  Camisolas: "images/produtos/Camisola_Vermelha_Renda_M_G/1.jpg",
  Robes: "images/produtos/Robe_Marsala_Renda_M_GG/1.jpg",
  "Mini Baby Doll": "images/produtos/Mini_Baby_Doll_Rosa_Verde_Tamanho_Unico/1.jpg",
};

const grid = document.querySelector("#product-grid");
const statusBox = document.querySelector("#catalog-status");
const resultCount = document.querySelector("#result-count");
const searchInput = document.querySelector("#search-input");
const headerSearchInput = document.querySelector("#header-search-input");
const sortSelect = document.querySelector("#sort-select");
const categoryList = document.querySelector("#category-list");
const quickFilters = document.querySelectorAll(".pill-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const favoritesPanel = document.querySelector("#favorites-panel");
const favoritesList = document.querySelector("#favorites-list");

function escapeHtml(value = "") {
  return value.toString().replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function parsePrice(value = "") {
  return Number.parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

function getFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  updatéFavoriteCount();
  renderFavoritesPanel();
}

function updatéFavoriteCount() {
  const total = getFavorites().length;
  document.querySelectorAll("[data-favorites-count]").forEach(item => {
    item.textContent = total;
  });
}

function showToast(message) {
  const toast = document.creatéElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 1700);
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(id);
  const next = isFavorite ? favorites.filter(item => item !== id) : [...favorites, id];
  saveFavorites(next);
  renderAllProducts();
  showToast(isFavorite ? "Produto removido dos favoritos." : "Produto salvo nos favoritos.");
}

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}


function normalize(text = "") {
  return text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function productMatches(product) {
  const search = normalize(state.search);
  const inCategory = state.category === "Todos" || product.categoria === state.category || (state.category === "Promoções" && product.promocao);
  const inQuickFilter = state.filter === "todos" || Boolean(product[state.filter]);
  const inSearch = !search || normalize(`${product.nome} ${product.categoria} ${product.descricao} ${product.cores?.join(" ")}`).includes(search);
  return inCategory && inQuickFilter && inSearch;
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    if (state.sort === "price-asc") return parsePrice(a.preco) - parsePrice(b.preco);
    if (state.sort === "price-desc") return parsePrice(b.preco) - parsePrice(a.preco);
    if (state.sort === "name") return a.nome.localeCompare(b.nome, "pt-BR");
    return Number(b.destaque) - Number(a.destaque) || Number(b.promocao) - Number(a.promocao) || a.id - b.id;
  });
}

function visibleProducts() {
  return sortProducts(state.products.filter(productMatches));
}

function productSizesLabel(product) {
  const sizes = product.tamanhos?.filter(Boolean) || [];
  if (!sizes.length) return "Tamanho: consulte";
  return `${sizes.length > 1 ? "Tamanhos" : "Tamanho"}: ${sizes.join("/")}`;
}
function productCard(product) {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(product.id);
  const discount = product.desconto ? `<span class="discount-badge">${escapeHtml(product.desconto)}</span>` : "";

  return `
    <article class="product-card">
      <div class="product-media">
        <a href="produto.html?id=${product.id}" aria-label="Ver detalhes de ${escapeHtml(product.nome)}">
          <img src="${escapeHtml(product.imagem)}" alt="${escapeHtml(product.nome)}" loading="lazy" onerror="this.onerror=null;this.src='images/logo_principal.jpg';this.classList.add('image-fallback')">
        </a>
        ${discount}
        <button class="favorite-btn ${isFavorite ? "active" : ""}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? "Remover" : "Adicionar"} ${escapeHtml(product.nome)} dos favoritos">♡</button>
      </div>
      <div class="product-info">
        <h3>${escapeHtml(product.nome)}</h3>
        <div class="price-row"><strong class="current-price">${escapeHtml(product.preco)}</strong></div>
        <div class="product-meta"><span>${escapeHtml(productSizesLabel(product))}</span></div>
        <div class="card-actions">
          <a class="btn btn-primary" href="produto.html?id=${product.id}">Ver detalhes</a>
          <a class="btn whatsapp-mini" href="${whatsappLink(product.whatsapp)}" target="_blank" rel="noreferrer" aria-label="Chamar no WhatsApp sobre ${escapeHtml(product.nome)}">${WHATSAPP_ICON}</a>
        </div>
      </div>
    </article>
  `;
}

function bindFavoriteButtons(scope = document) {
  scope.querySelectorAll("[data-favorite]").forEach(button => {
    button.addEventListener("click", () => toggleFavorite(Number(button.dataset.favorite)));
  });
}

function renderProductList(targetId, products) {
  const target = document.querySelector(`#${targetId}`);
  if (!target) return;
  target.innerHTML = products.map(productCard).join("");
  bindFavoriteButtons(target);
}

function renderStories() {
  const bestSellers = sortProducts(state.products.filter(product => product.destaque)).slice(0, 3);
  const under50 = sortProducts(state.products.filter(product => parsePrice(product.preco) <= 50)).slice(0, 3);
  const newest = sortProducts(state.products.filter(product => product.novidade)).slice(0, 3);

  renderProductList("best-sellers", bestSellers);
  renderProductList("under-50", under50);
  renderProductList("new-products", newest.length ? newest : state.products.slice(0, 3));
}

function renderCatalog() {
  const products = visibleProducts();
  grid.innerHTML = products.map(productCard).join("");
  resultCount.textContent = `${products.length} ${products.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
  statusBox.hidden = products.length > 0;
  if (!products.length) {
    statusBox.innerHTML = "<p>Nenhum produto encontrado com os filtros selecionados.</p>";
  }
  bindFavoriteButtons(grid);
}

function renderAllProducts() {
  renderStories();
  renderCatalog();
}

function renderFavoritesPanel() {
  if (!favoritesList) return;
  const favorites = getFavorites();
  const products = state.products.filter(product => favorites.includes(product.id));

  favoritesList.innerHTML = products.length ? products.map(product => `
    <article class="favorite-item">
      <img src="${escapeHtml(product.imagem)}" alt="${escapeHtml(product.nome)}" loading="lazy" onerror="this.onerror=null;this.src='images/logo_principal.jpg'">
      <div>
        <h3>${escapeHtml(product.nome)}</h3>
        <p>${escapeHtml(product.preco)}</p>
        <div class="favorite-item-actions">
          <a href="produto.html?id=${product.id}">Detalhes</a>
          <button type="button" data-remove-favorite="${product.id}">Remover</button>
        </div>
      </div>
    </article>
  `).join("") : '<div class="empty-panel">Sua lista ainda está vazia. Toque no coração de um produto para salvar.</div>';

  favoritesList.querySelectorAll("[data-remove-favorite]").forEach(button => {
    button.addEventListener("click", () => toggleFavorite(Number(button.dataset.removeFavorite)));
  });
}

function openFavoritesPanel() {
  renderFavoritesPanel();
  favoritesPanel?.classList.add("open");
  favoritesPanel?.setAttribute("aria-hidden", "false");
}

function closeFavoritesPanel() {
  favoritesPanel?.classList.remove("open");
  favoritesPanel?.setAttribute("aria-hidden", "true");
}

function renderCatégories() {
  const requested = ["Todos", "Baby Doll", "Mini Baby Doll", "Camisolas", "Conjuntos", "Pijamas", "Robes"];
  const hiddenCategories = ["Sutiãs", "Calcinhas", "Promoções"];
  const extra = [...new Set(state.products.map(product => product.categoria))].filter(category => !requested.includes(category) && !hiddenCategories.includes(category));
  const categories = [...requested, ...extra];

  categoryList.innerHTML = categories.map(category => `
    <button class="category-card ${category === state.category ? "active" : ""}" type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === state.category}">
      <span class="thumb"><img src="${escapeHtml(categoryImages[category] || categoryImages.Todos)}" alt="Categoria ${escapeHtml(category)}" loading="lazy" onerror="this.onerror=null;this.src='images/logo_principal.jpg'"></span>
      <strong>${escapeHtml(category)}</strong>
    </button>
  `).join("");

  categoryList.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => applyCategory(button.dataset.category));
  });
}

function applyCategory(category) {
  state.category = category;
  renderCatégories();
  renderCatalog();
  document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearFilters() {
  state.category = "Todos";
  state.filter = "todos";
  state.search = "";
  state.sort = "featured";
  if (searchInput) searchInput.value = "";
  if (headerSearchInput) headerSearchInput.value = "";
  if (sortSelect) sortSelect.value = "featured";
  quickFilters.forEach(item => item.classList.toggle("active", item.dataset.filter === "todos"));
  renderCatégories();
  renderCatalog();
}

function bindLayoutActions() {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#main-menu");
  menuButton?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  menu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      document.body.classList.remove("menu-open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelector(".search-focus")?.addEventListener("click", () => {
    document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchInput?.focus(), 350);
  });

  headerSearchInput?.addEventListener("input", event => {
    state.search = event.target.value;
    if (searchInput) searchInput.value = state.search;
    renderCatalog();
    document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll(".collection-card").forEach(button => {
    button.addEventListener("click", () => applyCategory(button.dataset.collection));
  });

  document.querySelectorAll(".favorite-open").forEach(button => {
    button.addEventListener("click", openFavoritesPanel);
  });
  document.querySelector(".panel-close")?.addEventListener("click", closeFavoritesPanel);
  favoritesPanel?.addEventListener("click", event => {
    if (event.target === favoritesPanel) closeFavoritesPanel();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeFavoritesPanel();
  });

  document.querySelectorAll(".js-whatsapp-general").forEach(link => {
    link.href = whatsappLink("Olá, vim pelo catálogo I-llopy e gostaria de atendimento.");
    link.target = "_blank";
    link.rel = "noreferrer";
  });

  const topButton = document.querySelector(".back-to-top");
  window.addEventListener("scroll", () => {
    topButton?.classList.toggle("visible", window.scrollY > 560);
  });
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  document.querySelector("#current-year").textContent = new Date().getFullYear();
}

async function loadProducts() {
  try {
    const response = await fetch("data/produtos.json");
    if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
    state.products = await response.json();
    statusBox.hidden = true;
    renderCatégories();
    renderAllProducts();
    renderFavoritesPanel();
  } catch (error) {
    statusBox.hidden = false;
    statusBox.innerHTML = `<p>O catálogo não carregou. Verifique o arquivo data/produtos.json e tente novamente.</p>`;
    console.error(error);
  }
}

searchInput?.addEventListener("input", event => {
  state.search = event.target.value;
  if (headerSearchInput) headerSearchInput.value = state.search;
  renderCatalog();
});

sortSelect?.addEventListener("change", event => {
  state.sort = event.target.value;
  renderCatalog();
});

quickFilters.forEach(button => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    quickFilters.forEach(item => item.classList.toggle("active", item === button));
    renderCatalog();
  });
});

clearFiltersButton?.addEventListener("click", clearFilters);

bindLayoutActions();
updatéFavoriteCount();
loadProducts();


