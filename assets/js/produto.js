const WHATSAPP_NUMBER = "5515999999999";
const FAVORITES_KEY = "illopy-favorites";
const WHATSAPP_ICON = '<svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16.02 3.2A12.73 12.73 0 0 0 5.08 22.43L3.2 29l6.72-1.78A12.72 12.72 0 1 0 16.02 3.2Zm0 2.28a10.44 10.44 0 0 1 8.86 15.98 10.42 10.42 0 0 1-13.44 3.3l-.48-.28-3.98 1.05 1.07-3.87-.31-.5A10.44 10.44 0 0 1 16.02 5.48Zm-4.05 5.36c-.24 0-.62.09-.95.45-.33.36-1.25 1.22-1.25 2.97 0 1.75 1.28 3.45 1.46 3.69.18.24 2.47 3.95 6.12 5.38 3.03 1.19 3.65.95 4.31.89.66-.06 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.89-1.78-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69Z"/></svg>';

const detail = document.querySelector("#product-detail");
const statusBox = document.querySelector("#product-status");
const relatedGrid = document.querySelector("#related-grid");
const breadcrumb = document.querySelector("#breadcrumb");
const favoritesPanel = document.querySelector("#favorites-panel");
const favoritesList = document.querySelector("#favorites-list");
let products = [];
let currentProduct = null;
let selectedColor = "";
let selectedSize = "";

function escapeHtml(value = "") {
  return value.toString().replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
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
  if (currentProduct) renderProduct(currentProduct);
  showToast(isFavorite ? "Produto removido dos favoritos." : "Produto salvo nos favoritos.");
}

function productMessage(product) {
  const color = selectedColor ? ` Cor: ${selectedColor}.` : "";
  const size = selectedSize ? ` Tamanho: ${selectedSize}.` : "";
  return `${product.whatsapp}${color}${size}`;
}

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}


function galleryItems(product) {
  return product.galeria?.length ? product.galeria : [product.imagem];
}

function productSizesLabel(product) {
  const sizes = product.tamanhos?.filter(Boolean) || [];
  if (!sizes.length) return "Tamanho: consulte";
  return `${sizes.length > 1 ? "Tamanhos" : "Tamanho"}: ${sizes.join("/")}`;
}
function productCard(product) {
  const discount = product.desconto ? `<span class="discount-badge">${escapeHtml(product.desconto)}</span>` : "";
  return `
    <article class="product-card">
      <div class="product-media">
        <a href="produto.html?id=${product.id}" aria-label="Ver detalhes de ${escapeHtml(product.nome)}"><img src="${escapeHtml(product.imagem)}" alt="${escapeHtml(product.nome)}" loading="lazy" onerror="this.onerror=null;this.src='images/logo_principal.jpg'"></a>
        ${discount}
      </div>
      <div class="product-info">
        <h3>${escapeHtml(product.nome)}</h3>
        <div class="price-row"><strong class="current-price">${escapeHtml(product.preco)}</strong></div>
        <div class="product-meta"><span>${escapeHtml(productSizesLabel(product))}</span></div>
        <div class="card-actions">
          <a class="btn btn-primary" href="produto.html?id=${product.id}">Ver detalhes</a>
          <a class="btn whatsapp-mini" href="${whatsappLink(product.whatsapp)}" target="_blank" rel="noreferrer">${WHATSAPP_ICON}</a>
        </div>
      </div>
    </article>
  `;
}

function renderBreadcrumb(product) {
  breadcrumb.innerHTML = `
    <a href="index.html">Início</a>
    <span>›</span>
    <a href="index.html#catalogo">${escapeHtml(product.categoria)}</a>
    <span>›</span>
    <span>${escapeHtml(product.nome)}</span>
  `;
}

function renderProduct(product) {
  currentProduct = product;
  selectedColor = selectedColor || product.cores?.[0] || "";
  selectedSize = selectedSize || product.tamanhos?.[0] || "";
  const images = galleryItems(product);
  const favorites = getFavorites();
  const isFavorite = favorites.includes(product.id);
  const discount = product.desconto ? `<span class="discount-badge">${escapeHtml(product.desconto)}</span>` : "";

  document.title = `${product.nome} | I-llopy`;
  document.querySelector("meta[name='description']")?.setAttribute("content", product.descricao);
  renderBreadcrumb(product);

  detail.innerHTML = `
    <div class="product-gallery">
      <div class="thumbnails" aria-label="Miniaturas do produto">
        ${images.map((image, index) => `
          <button class="thumb-button ${index === 0 ? "active" : ""}" type="button" data-image="${escapeHtml(image)}" aria-label="Ver imagem ${index + 1}">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.nome)} miniatura ${index + 1}" onerror="this.onerror=null;this.src='images/logo_principal.jpg'">
          </button>
        `).join("")}
      </div>
      <div class="main-image-wrap">
        <img id="main-product-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(product.nome)}" onerror="this.onerror=null;this.src='images/logo_principal.jpg'">
        ${discount}
        <button class="favorite-btn ${isFavorite ? "active" : ""}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? "Remover" : "Adicionar"} aos favoritos">♡</button>
        <button class="zoom-pill" type="button" id="zoom-button">Ampliar imagem</button>
      </div>
    </div>

    <div class="product-summary">
      <div class="summary-top">
        <div>
          <p class="eyebrow">${escapeHtml(product.categoria)}</p>
          <h1>${escapeHtml(product.nome)}</h1>
        </div>
      </div>
      <div class="detail-price"><strong class="current-price">${escapeHtml(product.preco)}</strong></div>
      <p class="short-description">${escapeHtml(product.descricao)}</p>

      <div class="option-group">
        <strong>Cores disponíveis</strong>
        <div class="swatches">${product.cores.map(color => `<button class="swatch ${color === selectedColor ? "active" : ""}" type="button" data-color="${escapeHtml(color)}">${escapeHtml(color)}</button>`).join("")}</div>
      </div>
      <div class="option-group">
        <strong>Tamanhos disponíveis</strong>
        <div class="sizes">${product.tamanhos.map(size => `<button class="size-chip ${size === selectedSize ? "active" : ""}" type="button" data-size="${escapeHtml(size)}">${escapeHtml(size)}</button>`).join("")}</div>
      </div>

      <div class="detail-actions">
        <a class="btn btn-primary" id="buy-whatsapp" href="${whatsappLink(productMessage(product))}" target="_blank" rel="noreferrer">Comprar pelo WhatsApp</a>
        <button class="btn btn-outline" type="button" data-favorite="${product.id}">${isFavorite ? "Remover da lista de desejos" : "Adicionar a lista de desejos"}</button>
      </div>

      <div class="purchase-benefits" aria-label="Beneficios da compra">
        <span>Frete para todo o Brasil</span>
        <span>Troca fácil em até 7 dias</span>
        <span>Compra 100% segura</span>
      </div>

      <div class="accordion">
        ${accordionItem("Descrição", escapeHtml(product.descricao), true)}
        ${accordionItem("Composição", escapeHtml(product.composicao || "Composição informada no atendimento da loja."))}
        ${accordionItem("Guia de medidas", "Confira as medidas P, M, G e GG pelo WhatsApp para garantir o caimento ideal.")}
      </div>
    </div>
  `;

  detail.hidden = false;
  statusBox.hidden = true;
  bindDetailActions();
}

function accordionItem(title, content, open = false) {
  const id = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  return `
    <div class="accordion-item">
      <button class="accordion-trigger" type="button" aria-expanded="${open}" aria-controls="panel-${id}">
        <span>${title}</span><span aria-hidden="true">+</span>
      </button>
      <div class="accordion-panel" id="panel-${id}" ${open ? "" : "hidden"}>${content}</div>
    </div>
  `;
}

function refreshWhatsappLink() {
  const link = document.querySelector("#buy-whatsapp");
  if (link && currentProduct) link.href = whatsappLink(productMessage(currentProduct));
}

function bindDetailActions() {
  const mainImage = document.querySelector("#main-product-image");
  document.querySelectorAll(".thumb-button").forEach(button => {
    button.addEventListener("click", () => {
      mainImage.src = button.dataset.image;
      document.querySelectorAll(".thumb-button").forEach(item => item.classList.toggle("active", item === button));
    });
  });

  document.querySelector("#zoom-button")?.addEventListener("click", () => {
    window.open(mainImage.src, "_blank", "noopener,noreferrer");
  });

  document.querySelectorAll("[data-color]").forEach(button => {
    button.addEventListener("click", () => {
      selectedColor = button.dataset.color;
      document.querySelectorAll("[data-color]").forEach(item => item.classList.toggle("active", item === button));
      refreshWhatsappLink();
    });
  });

  document.querySelectorAll("[data-size]").forEach(button => {
    button.addEventListener("click", () => {
      selectedSize = button.dataset.size;
      document.querySelectorAll("[data-size]").forEach(item => item.classList.toggle("active", item === button));
      refreshWhatsappLink();
    });
  });

  document.querySelectorAll("[data-favorite]").forEach(button => {
    button.addEventListener("click", () => toggleFavorite(Number(button.dataset.favorite)));
  });

  document.querySelectorAll(".accordion-trigger").forEach(button => {
    button.addEventListener("click", () => {
      const panel = document.querySelector(`#${button.getAttribute("aria-controls")}`);
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
}

function renderFavoritesPanel() {
  if (!favoritesList) return;
  const favorites = getFavorites();
  const savedProducts = products.filter(product => favorites.includes(product.id));

  favoritesList.innerHTML = savedProducts.length ? savedProducts.map(product => `
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
  `).join("") : '<div class="empty-panel">Sua lista ainda está vazia. Salve seus produtos preferidos para consultar depois.</div>';

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

function renderRelatéd(product) {
  const sameCategory = products.filter(item => item.id !== product.id && item.categoria === product.categoria);
  const fallback = products.filter(item => item.id !== product.id && item.destaque);
  const related = (sameCategory.length ? sameCategory : fallback).slice(0, 4);
  relatedGrid.innerHTML = related.length ? related.map(productCard).join("") : "<p class='result-line'>Em breve teremos mais produtos relacionados.</p>";
}

function bindLayoutActions() {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#main-menu");
  menuButton?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
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

async function loadProduct() {
  try {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    const response = await fetch("data/produtos.json");
    if (!response.ok) throw new Error("Não foi possível carregar os produtos.");
    products = await response.json();
    const product = products.find(item => item.id === id) || products[0];
    if (!product) throw new Error("Produto não encontrado.");
    renderProduct(product);
    renderRelatéd(product);
    renderFavoritesPanel();
  } catch (error) {
    statusBox.hidden = false;
    statusBox.innerHTML = "<p>Não foi possível carregar este produto. Volte ao catálogo e tente novamente.</p>";
    console.error(error);
  }
}

bindLayoutActions();
updatéFavoriteCount();
loadProduct();
