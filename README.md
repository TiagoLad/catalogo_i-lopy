# 🛍️ I-LLOPY AI — Assistente Inteligente para E-commerce

O **I-LLOPY AI** é um assistente virtual integrado ao catálogo online da I-LLOPY. O projeto utiliza **Inteligência Artificial Generativa com arquitetura RAG (Retrieval-Augmented Generation)** para responder dúvidas dos clientes com base nos documentos oficiais da loja.

O agente combina busca semântica, embeddings, índice vetorial FAISS e Google Gemini para recuperar trechos relevantes da base de conhecimento e gerar respostas contextualizadas, exibindo também as fontes utilizadas.

## 🌐 Projeto publicado

- **Catálogo / Frontend:** https://tiagolad.github.io/catalogo_i-lopy/
- **API / Health Check:** https://163.176.9.61/health
- **Documentação FastAPI:** https://163.176.9.61/docs
- **Repositório:** https://github.com/TiagoLad/catalogo_i-lopy

> O frontend está publicado no GitHub Pages e o backend está implantado em uma VM Oracle Cloud Infrastructure (OCI), com Nginx como proxy reverso e comunicação via HTTPS.

---

## 🎯 Objetivo do projeto

O projeto foi desenvolvido para criar um agente de IA capaz de:

- interpretar perguntas em linguagem natural;
- consultar documentos da I-LLOPY;
- localizar semanticamente os trechos mais relacionados à pergunta;
- utilizar apenas o contexto recuperado para apoiar a resposta;
- gerar respostas claras em português;
- informar quais documentos foram utilizados como fonte;
- reduzir alucinações e respostas sem respaldo documental;
- integrar a IA diretamente à experiência de um catálogo de e-commerce;
- disponibilizar a solução em ambiente público de nuvem.

O projeto demonstra, na prática, conceitos de **IA Generativa, RAG, embeddings, busca vetorial, processamento de PDFs, APIs REST, integração frontend/backend e deploy em cloud**.

---

## 🧠 Arquitetura da solução

```text
┌──────────────────────────────┐
│           Usuário            │
│       Catálogo I-LLOPY       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        GitHub Pages          │
│   HTML + CSS + JavaScript    │
│       Chat I-LLOPY AI        │
└──────────────┬───────────────┘
               │ HTTPS / POST /chat
               ▼
┌──────────────────────────────┐
│      Oracle Cloud (OCI)      │
│                              │
│          Nginx :443          │
│      Reverse Proxy HTTPS     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       FastAPI / Uvicorn      │
│          IlopyAgent          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         RAG Retriever        │
│                              │
│ Sentence Transformers        │
│ all-MiniLM-L6-v2             │
│            +                 │
│           FAISS              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Base de Conhecimento      │
│          PDFs I-LLOPY        │
└──────────────┬───────────────┘
               │ contexto recuperado
               ▼
┌──────────────────────────────┐
│        Google Gemini         │
│     Geração da resposta      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Resposta + Fontes       │
│       exibidas no chat       │
└──────────────────────────────┘
```

### Fluxo resumido

```text
Usuário
  ↓
GitHub Pages
  ↓ HTTPS
Nginx na OCI
  ↓
FastAPI
  ↓
Embedding da pergunta
  ↓
Busca vetorial no FAISS
  ↓
Top 3 trechos relevantes
  ↓
Contexto + pergunta
  ↓
Google Gemini
  ↓
Resposta + fontes
```

---

## 🔎 Como funciona o RAG

### 1. Leitura dos documentos

Os PDFs da pasta `backend/knowledge/` são processados com **PyPDF**.

```text
PDF → extração de texto
```

### 2. Divisão em chunks

O conteúdo extraído é dividido em trechos menores com sobreposição, preservando melhor o contexto entre partes consecutivas dos documentos.

### 3. Geração de embeddings

Os chunks são convertidos em vetores usando o modelo:

```text
sentence-transformers/all-MiniLM-L6-v2
```

### 4. Indexação vetorial

Os vetores são armazenados em um índice **FAISS**. O projeto utiliza similaridade vetorial para encontrar os trechos mais relacionados à pergunta.

### 5. Recuperação

A pergunta do usuário também é transformada em embedding e comparada ao índice. Por padrão, o agente recupera os **3 trechos mais relevantes**.

```text
Pergunta
   ↓
Embedding
   ↓
FAISS
   ↓
Top K chunks
```

### 6. Geração da resposta

Os trechos recuperados são enviados ao Gemini como contexto. O agente recebe instruções para responder com base nas informações disponibilizadas pela base de conhecimento.

---

## 💾 Persistência do índice FAISS

O índice vetorial é persistido para evitar o reprocessamento completo dos PDFs em toda inicialização da API.

```text
backend/data/vector_store/
├── index.faiss
└── metadata.json
```

- `index.faiss`: índice vetorial utilizado na busca semântica;
- `metadata.json`: chunks e metadados relacionados aos vetores.

Na inicialização:

```text
FastAPI
   ↓
Carrega index.faiss
   ↓
Carrega metadata.json
   ↓
Inicializa o modelo de embeddings
   ↓
Agente pronto
```

---

## 📚 Base de conhecimento

Atualmente o agente utiliza os seguintes documentos:

```text
backend/knowledge/
├── envios_entregas_ilopy.pdf
├── faq_ilopy.pdf
├── politica_privacidade_ilopy.pdf
├── termos_condicoes_ilopy.pdf
└── trocas_devolucoes_ilopy.pdf
```

A base cobre temas como entregas, dúvidas frequentes, privacidade, termos de uso, trocas e devoluções.

---

## 🛡️ Controle de alucinação

O agente foi projetado para reduzir respostas inventadas. Entre as regras utilizadas estão:

- responder com base no contexto recuperado;
- não inventar preços;
- não inventar estoque;
- não inventar tamanhos ou cores;
- não criar prazos de entrega inexistentes;
- não criar políticas da empresa;
- não confirmar informações ausentes na base;
- orientar o usuário quando não houver informação suficiente nos documentos.

---

## 🛠️ Tecnologias utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API
- GitHub Pages

### Backend

- Python 3.12
- FastAPI
- Uvicorn
- Pydantic
- python-dotenv

### Inteligência Artificial

- Google Gemini API
- Google GenAI SDK

### RAG e busca vetorial

- Sentence Transformers
- `all-MiniLM-L6-v2`
- FAISS
- NumPy

### Processamento de documentos

- PyPDF

### Cloud e infraestrutura

- Oracle Cloud Infrastructure (OCI)
- Ubuntu Linux
- Nginx
- systemd
- HTTPS / TLS
- iptables

### Versionamento

- Git
- GitHub

---

## 📁 Estrutura do projeto

```text
catalogo_i-lopy/
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── ai-chat.css
│   └── js/
│       ├── app.js
│       ├── produto.js
│       └── ai-chat.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   └── agent.py
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   └── client.py
│   │   └── rag/
│   │       ├── __init__.py
│   │       ├── loader.py
│   │       ├── chunker.py
│   │       ├── embeddings.py
│   │       └── retriever.py
│   │
│   ├── knowledge/
│   │   ├── envios_entregas_ilopy.pdf
│   │   ├── faq_ilopy.pdf
│   │   ├── politica_privacidade_ilopy.pdf
│   │   ├── termos_condicoes_ilopy.pdf
│   │   └── trocas_devolucoes_ilopy.pdf
│   │
│   ├── data/
│   │   └── vector_store/
│   │       ├── index.faiss
│   │       └── metadata.json
│   │
│   ├── scripts/
│   │   └── build_index.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── images/
├── index.html
├── produto.html
├── .gitignore
└── README.md
```

---

## 🚀 Executando localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/TiagoLad/catalogo_i-lopy.git
cd catalogo_i-lopy/backend
```

### 2. Criar o ambiente virtual

#### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar as dependências

```bash
pip install -r requirements.txt
```

As principais dependências do backend são:

```text
fastapi
uvicorn
python-dotenv
pydantic
pypdf
google-genai
numpy
faiss-cpu
sentence-transformers
```

---

## 🔑 Configuração do Gemini

Crie o arquivo:

```text
backend/.env
```

Use o `.env.example` como referência:

```env
GEMINI_API_KEY=sua_chave_gemini
GEMINI_MODEL=gemini-3.6-flash
```

> Nunca envie sua chave da API para o GitHub. O arquivo `.env` é ignorado pelo Git.

---

## 🧠 Gerando o índice vetorial

Se os PDFs da base de conhecimento forem adicionados ou modificados, recrie o índice:

```bash
cd backend
python -m scripts.build_index
```

Fluxo:

```text
PDFs
 ↓
Extração de texto
 ↓
Chunks
 ↓
Embeddings
 ↓
FAISS
 ↓
index.faiss + metadata.json
```

---

## ▶️ Iniciando a API

Dentro de `backend/`:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Endpoints locais:

```text
API:        http://127.0.0.1:8000
Health:     http://127.0.0.1:8000/health
Swagger UI: http://127.0.0.1:8000/docs
```

> Na primeira inicialização, o modelo de embeddings pode precisar ser baixado do Hugging Face e o carregamento pode levar mais tempo.

---

## 💬 Endpoint do agente

### `POST /chat`

Exemplo de requisição:

```json
{
  "question": "Como funciona o prazo de entrega?"
}
```

Exemplo de resposta:

```json
{
  "answer": "Resposta gerada com base nos documentos da I-LLOPY.",
  "sources": [
    "envios_entregas_ilopy.pdf"
  ]
}
```

### `GET /health`

Resposta esperada:

```json
{
  "status": "online"
}
```

---

## 🌐 Executando o frontend localmente

Com a API em execução, abra outro terminal na raiz do projeto:

```bash
python -m http.server 5500
```

Acesse:

```text
http://127.0.0.1:5500
```

Para desenvolvimento local, configure `ILOPY_AI_API` em `assets/js/ai-chat.js` para apontar para a API local. No ambiente publicado, o frontend utiliza a API HTTPS hospedada na OCI.

---

## ☁️ Deploy em Oracle Cloud Infrastructure

O backend está publicado em uma VM Linux na **Oracle Cloud Infrastructure**.

### Arquitetura de produção

```text
Internet
   ↓
HTTPS :443
   ↓
Nginx
   ↓
127.0.0.1:8000
   ↓
FastAPI / Uvicorn
   ↓
RAG + FAISS + Gemini
```

O serviço FastAPI é mantido em execução pelo `systemd`, enquanto o Nginx atua como proxy reverso HTTPS.

Exemplo de gerenciamento do serviço:

```bash
sudo systemctl status ilopy-api
sudo systemctl restart ilopy-api
sudo journalctl -u ilopy-api -n 50 --no-pager
```

O backend não precisa expor diretamente a porta `8000` para a internet; as requisições externas passam pelo Nginx.

---

## 🔐 Segurança

Algumas práticas adotadas no projeto:

- chave Gemini armazenada em `.env` e fora do Git;
- `.env` incluído no `.gitignore`;
- comunicação pública via HTTPS;
- Nginx como proxy reverso;
- FastAPI executando atrás do proxy;
- CORS restrito às origens utilizadas pelo projeto;
- porta da aplicação não utilizada diretamente pelo frontend público.

---

## 💬 Exemplos de perguntas

```text
Como funciona o prazo de entrega?
Como acompanho meu pedido?
Como funciona o envio dos produtos?
Como faço para devolver um produto?
Como funciona o reembolso?
Quais dados pessoais a I-LLOPY coleta?
Para que meus dados são utilizados?
Como entro em contato com a I-LLOPY?
Quais são as condições de uso da loja?
```

---

## 🧪 Testando a API

Health check:

```bash
curl https://163.176.9.61/health
```

Exemplo de chamada ao agente:

```bash
curl -X POST https://163.176.9.61/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Como funciona o prazo de entrega?"}'
```

---

## ✅ Status do projeto

- [x] Catálogo web responsivo
- [x] Interface de chat integrada ao frontend
- [x] API FastAPI
- [x] Processamento de documentos PDF
- [x] Chunking de conteúdo
- [x] Embeddings com Sentence Transformers
- [x] Busca vetorial com FAISS
- [x] Persistência do índice vetorial
- [x] Integração com Google Gemini
- [x] Respostas com indicação de fontes
- [x] CORS para integração com GitHub Pages
- [x] Frontend publicado no GitHub Pages
- [x] Backend publicado na Oracle Cloud Infrastructure
- [x] Nginx como proxy reverso
- [x] HTTPS na API pública
- [x] Serviço FastAPI gerenciado pelo systemd

---

## 📌 Possíveis evoluções

- tratamento amigável para limites temporários da API Gemini;
- cache de respostas para perguntas recorrentes;
- painel administrativo para gerenciar documentos;
- atualização automática do índice ao adicionar documentos;
- métricas de uso e observabilidade;
- autenticação para endpoints administrativos;
- testes automatizados adicionais;
- domínio próprio para a API.

---

## 👨‍💻 Autor

Projeto desenvolvido por **Tiago Ladeira Mantovani** como aplicação prática de Inteligência Artificial Generativa, RAG, APIs e cloud computing.

GitHub: https://github.com/TiagoLad
