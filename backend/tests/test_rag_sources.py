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


retriever = Retriever(chunks)


questions = [

    "Quais dados pessoais a I-LLOPY coleta?",

    "Como faço para devolver um produto?",

    "Como faço para comprar uma peça?",

    "Como funciona o prazo de entrega?",

    "A disponibilidade do produto é garantida pelo catálogo?",

]


for question in questions:

    print("\n")
    print("=" * 80)
    print("PERGUNTA:")
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
        print(f"RESULTADO {index}")
        print(
            "Fonte:",
            result["source"]
        )

        print(
            "Score:",
            round(
                result["score"],
                4
            )
        )

        print(
            "Trecho:",
            result["text"][:300]
        )