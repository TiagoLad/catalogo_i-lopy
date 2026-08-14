from pathlib import Path

from app.rag.loader import load_knowledge_base
from app.rag.chunker import split_text_into_chunks


knowledge_path = Path("knowledge")

documents = load_knowledge_base(knowledge_path)

for document in documents:

    print("=" * 60)
    print("Documento:", document["source"])

    chunks = split_text_into_chunks(
        document["text"],
        chunk_size=500,
        overlap=100
    )

    print("Quantidade de chunks:", len(chunks))

    for index, chunk in enumerate(chunks, start=1):
        print()
        print(f"--- Chunk {index} ---")
        print(chunk)