from pathlib import Path

from app.rag.loader import load_knowledge_base
from app.rag.chunker import split_text_into_chunks
from app.rag.retriever import Retriever


backend_path = Path(__file__).resolve().parents[1]

knowledge_path = (
    backend_path
    / "knowledge"
)

vector_store_path = (
    backend_path
    / "data"
    / "vector_store"
)


print(
    "Carregando documentos..."
)

documents = load_knowledge_base(
    knowledge_path
)

chunks = []

for document in documents:

    document_chunks = (
        split_text_into_chunks(
            document["text"],
            chunk_size=500,
            overlap=100
        )
    )

    for chunk in document_chunks:

        chunks.append(
            {
                "text": chunk,
                "source": document["source"]
            }
        )


print(
    f"Documentos carregados: {len(documents)}"
)

print(
    f"Chunks criados: {len(chunks)}"
)


retriever = Retriever(
    chunks
)

retriever.save(
    vector_store_path
)


print(
    "Índice FAISS criado com sucesso."
)

print(
    f"Local: {vector_store_path}"
)