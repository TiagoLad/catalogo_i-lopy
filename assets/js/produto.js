// Edite apenas esta constante para trocar o número de atendimento.
const WHATSAPP_NUMBER = "55SEUNUMEROAQUI";

const statusBox = document.querySelector("#product-status");
const detail = document.querySelector("#product-detail");

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function placeholderImage(name) {
  const safeName = String(name).replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 720"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#fff0f5"/><stop offset="1" stop-color="#ecc6d5"/></linearGradient></defs><rect width="640" height="720" fill="url(#g)"/><text x="320" y="345" text-anchor="middle" fill="#d93379" font-family="Georgia,serif" font-size="70" font-weight="bold">I-llopy</text><text x="320" y="400" text-anchor="middle" fill="#6f676a" font-family="Arial,sans-serif" font-size="24">${safeName}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function showError(message) {
  statusBox.classList.add("error");
  statusBox.innerHTML = `<p><strong>${message}</strong><br><a class="back-link" href="index.html">Voltar ao catálogo</a></p>`;
}

function renderProduct(product) {
  const imageWrap = document.createElement("div");
  imageWrap.className = "detail-image-wrap";
  const image = document.createElement("img");
  image.className = "detail-image";
  image.src = product.imagem;
  image.alt = `${product.nome} — ${product.categoria}`;
  image.decoding = "async";
  image.addEventListener("error", () => { image.src = placeholderImage(product.nome); }, { once: true });
  imageWrap.append(image);

  const content = document.createElement("div");
  content.className = "detail-content";
  const category = document.createElement("p");
  category.className = "category-label";
  category.textContent = product.categoria;
  const title = document.createElement("h1");
  title.textContent = product.nome;
  const price = document.createElement("p");
  price.className = "detail-price";
  price.textContent = product.preco;
  const description = document.createElement("p");
  description.className = "detail-description";
  description.textContent = product.descricao;
  const buyLink = document.createElement("a");
  buyLink.className = "button button-primary";
  buyLink.href = whatsappUrl(product.whatsapp || `Olá, tenho interesse no produto ${product.nome}.`);
  buyLink.target = "_blank";
  buyLink.rel = "noopener noreferrer";
  buyLink.textContent = "Comprar pelo WhatsApp";
  content.append(category, title, price, description, buyLink);

  detail.replaceChildren(imageWrap, content);
  detail.hidden = false;
  statusBox.hidden = true;
  document.title = `${product.nome} | I-llopy`;
  document.querySelector('meta[name="description"]').content = `${product.nome}: ${product.descricao}`;
  document.querySelector('meta[property="og:title"]').content = `${product.nome} | I-llopy`;
  document.querySelector('meta[property="og:description"]').content = product.descricao;
  document.querySelector('meta[property="og:image"]').content = product.imagem;
}

async function loadProduct() {
  const rawId = new URLSearchParams(window.location.search).get("id");
  if (!rawId) { showError("Produto não informado."); return; }
  try {
    const response = await fetch("data/produtos.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Formato de JSON inválido");
    const product = products.find((item) => String(item.id) === rawId);
    if (!product) { showError("Produto não encontrado."); return; }
    renderProduct(product);
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    showError("Não foi possível carregar este produto.");
  }
}

loadProduct();
