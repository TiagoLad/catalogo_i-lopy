from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


from app.agent.agent import IlopyAgent

app = FastAPI(
    title="I-LLOPY AI",
    description=(
        "Agente inteligente com arquitetura RAG "
        "para atendimento do e-commerce I-LLOPY."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://tiagolad.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = IlopyAgent()


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=2,
        description="Pergunta enviada pelo usuário."
    )


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/")
def root():
    return {
        "name": "I-LLOPY AI",
        "message": "API do agente inteligente está funcionando."
    }


@app.get("/health")
def health():
    return {
        "status": "online"
    }


@app.post(
    "/chat",
    response_model=ChatResponse
)
def chat(request: ChatRequest):
    result = agent.answer(request.question)

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )