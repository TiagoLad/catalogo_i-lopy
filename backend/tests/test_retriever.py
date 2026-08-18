from pathlib import Path

from app.rag.loader import load_knowledge_base
from app.rag.chunker import split_text_into_chunks
from app.rag.retriever import Retriever


knowledge_path = Path("knowledge")

documents = load_knowledge_base(knowledge_path)

chunks = []

for document in documents:

    document_chunks = split_text_into_chunks(
        document["text"],
        chunk_size=500,
        overlap=100
    )

    for chunk in document_chunks:
        chunks.append(
            {
                "text": chunk,
                "source": document["source"]
            }
        )


print("Documentos carregados:", len(documents))
print("Chunks criados:", len(chunks))


retriever = Retriever(chunks)


question = "Como funciona a troca de produtos?"

print()
print("Pergunta:")
print(question)

results = retriever.search(
    question,
    top_k=3
)


for index, result in enumerate(
    results,
    start=1
):
    print()
    print("=" * 60)
    print(f"Resultado {index}")
    print("Fonte:", result["source"])
    print("Score:", round(result["score"], 4))
    print()
    print(result["text"])