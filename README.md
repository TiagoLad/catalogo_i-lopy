# 🛍️ I-LLOPY AI — Assistente Inteligente para E-commerce

O **I-LLOPY AI** é um assistente virtual inteligente integrado ao catálogo online da I-LLOPY.

O projeto utiliza **Inteligência Artificial Generativa com arquitetura RAG (Retrieval-Augmented Generation)** para responder perguntas dos clientes utilizando exclusivamente informações presentes na base de conhecimento da loja.

O objetivo é oferecer ao usuário respostas rápidas sobre temas como:

- entregas;
- devoluções;
- reembolsos;
- privacidade;
- termos e condições;
- funcionamento da loja;
- dúvidas frequentes.

Diferente de um chatbot baseado apenas em respostas pré-programadas, o I-LLOPY AI realiza uma busca semântica nos documentos da empresa e utiliza os trechos mais relevantes como contexto para gerar a resposta.

---

# 🎯 Objetivo do Projeto

O projeto foi desenvolvido com o objetivo de criar um agente de IA capaz de:

- interpretar perguntas em linguagem natural;
- consultar documentos da empresa;
- localizar informações semanticamente relacionadas à pergunta;
- fornecer contexto relevante ao modelo de linguagem;
- gerar respostas claras em português;
- informar os documentos utilizados como fonte;
- reduzir respostas inventadas ou sem respaldo documental;
- integrar o agente diretamente à interface de um e-commerce.

O projeto demonstra na prática conceitos de:

- Inteligência Artificial Generativa;
- RAG;
- embeddings;
- busca vetorial;
- processamento de documentos;
- APIs REST;
- integração entre frontend e backend.

---

# 🧠 Arquitetura da Solução

A solução foi dividida em frontend, backend, mecanismo RAG e modelo de linguagem.

```text
┌───────────────────────────────┐
│         Usuário               │
│        I-LLOPY Store          │
└───────────────┬───────────────┘
                │
                │ Pergunta
                ▼
┌───────────────────────────────┐
│       Interface Web           │
│   HTML + CSS + JavaScript     │
│                               │
│      Assistente I-LLOPY       │
└───────────────┬───────────────┘
                │
                │ POST /chat
                ▼
┌───────────────────────────────┐
│           FastAPI             │
│                               │
│          IlopyAgent           │
└───────────────┬───────────────┘
                │
                │ Busca semântica
                ▼
┌───────────────────────────────┐
│       Retriever / RAG         │
│                               │
│ Sentence Transformers         │
│            +                  │
│           FAISS               │
└───────────────┬───────────────┘
                │
                │ Trechos relevantes
                ▼
┌───────────────────────────────┐
│     Base de Conhecimento      │
│                               │
│          Arquivos PDF         │
│                               │
│ Privacidade                   │
│ FAQ                           │
│ Entregas                      │
│ Reembolsos                    │
│ Termos e Condições            │
└───────────────────────────────┘

                │
                │ Contexto recuperado
                ▼
┌───────────────────────────────┐
│         Google Gemini         │
│                               │
│     Geração da resposta       │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        Resposta + Fontes      │
│                               │
│       exibidas no chat        │
└───────────────────────────────┘
```

---

# 🔎 Como funciona o RAG

O mecanismo RAG utilizado pelo projeto funciona em diferentes etapas.

### 1. Leitura dos documentos

Os arquivos PDF presentes na base de conhecimento são processados utilizando `PyPDF`.

```text
PDF
 ↓
Extração do texto
```

### 2. Divisão em chunks

O conteúdo é dividido em pequenos trechos de texto.

```text
Documento
 ↓
Chunk 1
Chunk 2
Chunk 3
...
```

Os chunks possuem sobreposição entre si para evitar perda de contexto entre partes do documento.

### 3. Geração dos embeddings

Cada trecho é convertido em um vetor numérico utilizando:

```text
sentence-transformers/all-MiniLM-L6-v2
```

### 4. Indexação vetorial

Os embeddings são armazenados em um índice:

```text
FAISS
```

O projeto utiliza busca por similaridade vetorial para encontrar os trechos mais relacionados à pergunta realizada pelo usuário.

### 5. Recuperação de contexto

Quando o usuário realiza uma pergunta:

```text
Pergunta
   ↓
Embedding
   ↓
Busca FAISS
   ↓
Top K documentos/chunks
```

Por padrão, o agente recupera os **3 trechos mais relevantes**.

### 6. Geração da resposta

Os trechos recuperados são enviados ao Gemini como contexto.

O modelo é instruído a responder utilizando exclusivamente as informações encontradas na base de conhecimento.

---

# 💾 Persistência do índice FAISS

Para evitar que todos os PDFs sejam processados e todos os embeddings sejam gerados novamente sempre que a API for iniciada, o índice vetorial é persistido.

Os arquivos gerados são:

```text
backend/data/vector_store/

├── index.faiss
└── metadata.json
```

O `index.faiss` contém o índice vetorial.

O `metadata.json` armazena os textos e documentos relacionados aos vetores.

Assim, durante a inicialização da aplicação:

```text
FastAPI
   ↓
Carrega index.faiss
   ↓
Carrega metadata.json
   ↓
Agente pronto
```

Isso reduz o tempo de inicialização da aplicação.

---

# 📚 Base de Conhecimento

Atualmente o agente utiliza documentos relacionados às principais regras e informações da loja.

```text
backend/knowledge/

├── politica_privacidade_ilopy.pdf
├── politica_reembolso_devolucoes_ilopy.pdf
├── faq_ilopy.pdf
├── envios_entregas_ilopy.pdf
└── termos_condicoes_ilopy.pdf
```

Esses documentos são utilizados como fonte pelo mecanismo RAG.

---

# 🛡️ Controle de Alucinação

O agente possui instruções específicas para reduzir respostas inventadas.

Entre as regras utilizadas estão:

- responder utilizando somente o contexto recuperado;
- não inventar preços;
- não inventar estoque;
- não inventar tamanhos ou cores disponíveis;
- não criar prazos de entrega inexistentes;
- não criar políticas da empresa;
- não confirmar informações que não estejam presentes nos documentos;
- informar ao cliente quando a informação não estiver disponível na base.

Caso o agente não encontre informação suficiente, ele é orientado a recomendar o contato com o atendimento da I-LLOPY.

---

# 🛠️ Tecnologias e Ferramentas

## Backend

- Python 3.12
- FastAPI
- Uvicorn
- Pydantic
- python-dotenv

## Inteligência Artificial

- Google Gemini API
- Google GenAI SDK

## RAG e Busca Vetorial

- Sentence Transformers
- `all-MiniLM-L6-v2`
- FAISS
- NumPy

## Processamento de documentos

- PyPDF

## Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API

## Versionamento

- Git
- GitHub

## Hospedagem do frontend

- GitHub Pages

---

# 📁 Estrutura do Projeto

```text
Catalogo_I-llopy/
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── ai-chat.css
│   │
│   └── js/
│       ├── app.js
│       └── ai-chat.js
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── agent/
│   │   │   └── agent.py
│   │   │
│   │   ├── llm/
│   │   │   └── client.py
│   │   │
│   │   └── rag/
│   │       ├── loader.py
│   │       ├── chunker.py
│   │       ├── embeddings.py
│   │       └── retriever.py
│   │
│   ├── knowledge/
│   │   ├── politica_privacidade_ilopy.pdf
│   │   ├── politica_reembolso_devolucoes_ilopy.pdf
│   │   ├── faq_ilopy.pdf
│   │   ├── envios_entregas_ilopy.pdf
│   │   └── termos_condicoes_ilopy.pdf
│   │
│   ├── data/
│   │   └── vector_store/
│   │       ├── index.faiss
│   │       └── metadata.json
│   │
│   ├── scripts/
│   │   └── build_index.py
│   │
│   ├── tests/
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── images/
│
├── index.html
├── produto.html
├── .gitignore
└── README.md
```

---

# 🚀 Como executar o projeto

## 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd Catalogo_I-llopy
```

---

## 2. Criar ambiente virtual

No Windows:

```powershell
python -m venv .venv
```

Ative o ambiente:

```powershell
.\.venv\Scripts\Activate.ps1
```

No Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 3. Instalar as dependências

Entre no backend:

```bash
cd backend
```

Instale:

```bash
pip install -r requirements.txt
```

---

# 🔑 Configuração do Gemini

Crie um arquivo:

```text
backend/.env
```

Utilize o `.env.example` como referência.

Exemplo:

```env
GEMINI_API_KEY=sua_chave_gemini
GEMINI_MODEL=gemini-3.6-flash
```

> A chave da API nunca deve ser enviada para o GitHub.

O arquivo `.env` está incluído no `.gitignore`.

O modelo configurado pode ser alterado de acordo com os modelos disponíveis na conta utilizada.

---

# 🧠 Gerando o índice vetorial

Caso os documentos da pasta `knowledge` sejam modificados, o índice FAISS deve ser recriado.

Execute, dentro de `backend`:

```bash
python -m scripts.build_index
```

O processo executará:

```text
PDFs
 ↓
Extração
 ↓
Chunks
 ↓
Embeddings
 ↓
FAISS
 ↓
index.faiss
+
metadata.json
```

Depois disso, reinicie a API.

---

# ▶️ Iniciando a API

Dentro da pasta:

```text
backend/
```

execute:

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

Documentação automática:

```text
http://127.0.0.1:8000/docs
```

Health Check:

```text
http://127.0.0.1:8000/health
```

---

# 💬 Endpoint do Agente

O endpoint principal é:

```http
POST /chat
```

Exemplo de requisição:

```json
{
  "question": "Como funciona o prazo de entrega?"
}
```

Exemplo de retorno:

```json
{
  "answer": "O prazo de entrega pode variar de acordo com a localização, disponibilidade do produto, modalidade de envio e transportadora.",
  "sources": [
    "envios_entregas_ilopy.pdf"
  ]
}
```

---

# 🌐 Executando o Frontend

Abra outro terminal na raiz do projeto.

Execute:

```bash
python -m http.server 5500
```

Acesse:

```text
http://127.0.0.1:5500
```

O frontend enviará as perguntas para a API FastAPI através do endpoint:

```text
POST /chat
```

---

# 💬 Exemplos de perguntas

O assistente consegue responder perguntas como:

### Entregas

```text
Como funciona o prazo de entrega?
```

```text
Como acompanho meu pedido?
```

```text
Como funciona o envio dos produtos?
```

### Devoluções e reembolsos

```text
Como faço para devolver um produto?
```

```text
Como funciona o reembolso?
```

```text
Posso desistir de uma compra realizada online?
```

### Privacidade

```text
Quais dados pessoais a I-LLOPY coleta?
```

```text
Para que meus dados são utilizados?
```

### Produtos

```text
A disponibilidade dos produtos é garantida pelo catálogo?
```

```text
Como faço para comprar uma peça?
```

### Atendimento

```text
Como entro em contato com a I-LLOPY?
```

### Termos

```text
Quais são as condições de uso da loja?
```

---

# 🤖 Exemplos de respostas do agente

## Pergunta

```text
Como funciona o prazo de entrega?
```

### Exemplo de resposta

> O prazo de entrega pode variar de acordo com o endereço informado, a modalidade de envio, a disponibilidade do produto, o processamento do pedido e a transportadora responsável. As condições de entrega são informadas durante o processo de compra.

**Fonte utilizada:**

```text
Envios e Entregas
```

---

## Pergunta

```text
Como faço para devolver um produto?
```

### Exemplo de resposta

> Para solicitar uma devolução, entre em contato com o atendimento da I-LLOPY. Nas compras realizadas online, o consumidor pode solicitar a devolução dentro do prazo previsto para o direito de arrependimento, seguindo as condições descritas na política de devoluções.

**Fonte utilizada:**

```text
Política de Reembolso e Devoluções
```

---

## Pergunta

```text
Quais dados pessoais a I-LLOPY coleta?
```

### Exemplo de resposta

> A I-LLOPY pode utilizar dados necessários para atendimento e processamento das solicitações dos clientes, como nome, telefone, endereço e informações relacionadas ao pedido, conforme descrito em sua Política de Privacidade.

**Fonte utilizada:**

```text
Política de Privacidade
```

---

## Pergunta

```text
A disponibilidade do produto é garantida pelo catálogo?
```

### Exemplo de resposta

> Não. A exibição de um produto no catálogo não representa garantia automática de disponibilidade. A confirmação deve ser realizada de acordo com as informações e canais disponibilizados pela I-LLOPY.

**Fonte utilizada:**

```text
Termos e Condições
```

---

# ⚠️ Perguntas sem informação na base

O agente foi configurado para não inventar informações.

Por exemplo:

```text
Vocês possuem essa camiseta na cor azul tamanho M?
```

Caso essa informação não esteja presente nos documentos, o agente deve informar que não conseguiu confirmá-la na base de conhecimento e orientar o usuário a entrar em contato com o atendimento.

Esse comportamento reduz o risco de respostas incorretas sobre:

```text
estoque
preços
cores
tamanhos
prazos
descontos
formas de pagamento
```

---

# 🔄 Fluxo completo da aplicação

```text
Usuário
  ↓
Pergunta no chat
  ↓
JavaScript
  ↓
POST /chat
  ↓
FastAPI
  ↓
IlopyAgent
  ↓
Embedding da pergunta
  ↓
FAISS
  ↓
Busca semântica
  ↓
3 chunks mais relevantes
  ↓
Contexto
  ↓
Google Gemini
  ↓
Resposta
  ↓
FastAPI
  ↓
Frontend
  ↓
Resposta + fontes
```

---

# ✅ Funcionalidades implementadas

- [x] Catálogo web responsivo
- [x] Assistente IA integrado ao frontend
- [x] API REST utilizando FastAPI
- [x] Leitura de documentos PDF
- [x] Divisão de documentos em chunks
- [x] Geração de embeddings
- [x] Busca semântica
- [x] Banco vetorial FAISS
- [x] Persistência do índice FAISS
- [x] Integração com Google Gemini
- [x] Recuperação de múltiplas fontes
- [x] Exibição das fontes utilizadas
- [x] Controle de respostas fora da base
- [x] Interface responsiva do chat
- [x] Indicador de geração de resposta
- [x] Sugestões de perguntas
- [x] Health Check da API
- [ ] Deploy público do backend
- [ ] Integração final com ambiente de produção

---

# 🧪 Testes

O projeto possui testes para os principais componentes do pipeline RAG.

Entre eles:

```text
Loader
Chunker
Embeddings
Retriever
Recuperação de fontes
```

Exemplo:

```bash
python -m tests.test_rag_sources
```

Esse teste permite verificar quais documentos e trechos estão sendo recuperados para diferentes perguntas.

---

# 🌎 Frontend

O catálogo da I-LLOPY pode ser publicado utilizando **GitHub Pages**.

O frontend se comunica de forma independente com o backend através da API REST, permitindo que as duas partes da aplicação sejam hospedadas separadamente.

Arquitetura de produção:

```text
GitHub Pages
     │
     │ HTTPS
     ▼
Backend em Cloud
     │
     ▼
FastAPI
     │
     ├── FAISS
     └── Gemini
```

---

# 🔐 Segurança

Informações sensíveis não são armazenadas diretamente no código-fonte.

A chave da API Gemini é definida utilizando variável de ambiente:

```env
GEMINI_API_KEY
```

Arquivos `.env` são ignorados pelo Git através do `.gitignore`.

---

# 📈 Evolução do Projeto

O desenvolvimento foi realizado de forma incremental:

```text
Fase 1
Estrutura inicial + FastAPI

        ↓

Fase 2
Pipeline RAG

        ↓

Fase 3
Embeddings + FAISS + Gemini

        ↓

Fase 4
Integração do assistente ao catálogo

        ↓

Otimização
Persistência do índice FAISS

        ↓

Deploy
Ambiente em nuvem
```

O histórico de commits do repositório demonstra essa evolução.

---

# 👨‍💻 Autor

Projeto desenvolvido por **Tiago** como projeto prático de Inteligência Artificial Generativa, RAG, APIs e integração de aplicações web.

---

# 📄 Licença

Projeto desenvolvido para fins educacionais e de demonstração.
