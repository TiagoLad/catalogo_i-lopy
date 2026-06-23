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
- WhatsApp configurado em `assets/js/app.js` e `assets/js/produto.js`: `5515981421352`.
- Instagram configurado em `index.html`: `https://www.instagram.com/i.llopy/`.
- Edite nomes, preços, descrições, categorias e fotos em `data/produtos.json`.

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
│   └── produtos/
└── assets/
    ├── css/style.css
    └── js/app.js, produto.js
```
