from fastapi import FastAPI

app = FastAPI(
    title="I-LLOPY AI",
    description="Agente inteligente para atendimento do e-commerce I-LLOPY",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "I-LLOPY AI está funcionando."
    }


@app.get("/health")
def health():
    return {
        "status": "online"
    }