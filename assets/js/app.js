// Edite apenas esta constante para trocar o número de atendimento.
// Use código do país + DDD + número, somente dígitos. Ex.: 5511999999999.
const WHATSAPP_NUMBER = "55SEUNUMEROAQUI";

const state = { products: [], category: "Todos", search: "" };
const grid = document.querySelector("#product-grid");
const statusBox = document.querySelector("#catalog-status");
const countBox = document.querySelector("#results-count");
const searchInput = document.querySelector("#search-input");
const filters = document.querySelector("#category-filters");

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function placeholderImage(name) {
  const safeName = String(name).replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 720"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#fff0f5"/><stop offset="1" stop-color="#ecc6d5"/></linearGradient></defs><rect width="640" height="720" fill="url(#g)"/><circle cx="540" cy="110" r="150" fill="#fff" opacity=".35"/><text x="320" y="335" text-anchor="middle" fill="#d93379" font-family="Georgia,serif" font-size="70" font-weight="bold">I-llopy</text><text x="320" y="390" text-anchor="middle" fill="#6f676a" font-family="Arial,sans-serif" font-size="24">${safeName}</text><text x="320" y="610" text-anchor="middle" fill="#9c7081" font-family="Arial,sans-serif" font-size="18">Imagem ilustrativa</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeText(text) {
  return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image-wrap";
  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.imagem;
  image.alt = `${product.nome} — ${product.categoria}`;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => { image.src = placeholderImage(product.nome); }, { once: true });
  imageWrap.append(image);

  if (product.destaque) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "Destaque";
    imageWrap.append(badge);
  }

  const body = document.createElement("div");
  body.className = "product-card-body";
  const category = document.createElement("p");
  category.className = "category-label";
  category.textContent = product.categoria;
  const title = document.createElement("h3");
  title.textContent = product.nome;
  const price = document.createElement("p");
  price.className = "price";
  price.textContent = product.preco;
  const description = document.createElement("p");
  description.className = "description";
  description.textContent = product.descricao;

  const actions = document.createElement("div");
  actions.className = "card-actions";
  const detailLink = document.createElement("a");
  detailLink.className = "button button-outline";
  detailLink.href = `produto.html?id=${encodeURIComponent(product.id)}`;
  detailLink.textContent = "Ver detalhes";
  const buyLink = document.createElement("a");
  buyLink.className = "button button-primary";
  buyLink.href = whatsappUrl(product.whatsapp || `Olá, tenho interesse no produto ${product.nome}.`);
  buyLink.target = "_blank";
  buyLink.rel = "noopener noreferrer";
  buyLink.textContent = "Comprar pelo WhatsApp";
  buyLink.setAttribute("aria-label", `Comprar ${product.nome} pelo WhatsApp`);

  actions.append(detailLink, buyLink);
  body.append(category, title, price, description, actions);
  card.append(imageWrap, body);
  return card;
}

function renderProducts() {
  const filtered = state.products.filter((product) => {
    const matchesCategory = state.category === "Todos" || product.categoria === state.category ||
      (state.category === "Promoções" && product.promocao === true);
    return matchesCategory && normalizeText(product.nome).includes(normalizeText(state.search));
  });

  grid.replaceChildren();
  statusBox.hidden = true;
  countBox.textContent = `${filtered.length} ${filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}`;

  if (!filtered.length) {
    statusBox.hidden = false;
    statusBox.innerHTML = "<p>Nenhum produto encontrado. Tente outra busca ou categoria.</p>";
    return;
  }
  const fragment = document.createDocumentFragment();
  filtered.forEach((product) => fragment.append(createProductCard(product)));
  grid.append(fragment);
}

async function loadProducts() {
  try {
    const response = await fetch("data/produtos.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Formato de JSON inválido");
    state.products = data;
    renderProducts();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    countBox.textContent = "";
    statusBox.classList.add("error");
    statusBox.innerHTML = "<p><strong>Não foi possível carregar o catálogo.</strong><br>Abra o projeto com um servidor local (como Live Server) e tente novamente.</p>";
  }
}

searchInput.addEventListener("input", (event) => { state.search = event.target.value.trim(); renderProducts(); });
filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  filters.querySelectorAll(".filter-button").forEach((item) => {
    const selected = item === button;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
});

document.querySelectorAll(".js-general-whatsapp").forEach((link) => {
  link.href = whatsappUrl("Olá! Gostaria de conhecer o catálogo da I-llopy.");
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});
document.querySelector("#current-year").textContent = new Date().getFullYear();
loadProducts();
