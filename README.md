# Catálogo I-llopy

Catálogo online estático e responsivo feito somente com HTML, CSS, JavaScript e JSON, sem backend ou dependências externas.

## Executar localmente

O catálogo usa `fetch`, portanto deve ser aberto por um servidor HTTP, e não diretamente por `file://`.

1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server**, se necessário.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

## Personalizar

- Adicione o logo em `images/logo_principal.jpg`.
- Adicione as fotos em `images/produtos/` e ajuste os caminhos em `data/produtos.json`.
- Troque `55SEUNUMEROAQUI` na constante `WHATSAPP_NUMBER` de `assets/js/app.js` e `assets/js/produto.js`. Use país + DDD + número, somente dígitos. Exemplo: `5511999999999`.
- Troque `SEUINSTAGRAMAQUI` nos links de `index.html`.
- Edite os itens em `data/produtos.json`. O campo `promocao: true` inclui o produto no filtro **Promoções**.

Enquanto uma foto não existir, o site exibe automaticamente uma imagem ilustrativa sem quebrar o layout.

## Publicar no GitHub Pages

1. Envie os arquivos para um repositório GitHub.
2. Acesse **Settings > Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha a branch principal, a pasta `/ (root)` e salve.

Todos os caminhos são relativos, então o projeto funciona também em uma subpasta do GitHub Pages.

## Estrutura

```text
├── index.html
├── produto.html
├── README.md
├── data/produtos.json
├── images/
│   ├── logo_principal.jpg
│   └── produtos/exemplo-01.jpg, exemplo-02.jpg, exemplo-03.jpg
└── assets/
    ├── css/style.css
    └── js/app.js, produto.js
```
