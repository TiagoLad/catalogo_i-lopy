from pathlib import Path

from app.rag.loader import load_knowledge_base


knowledge_path = Path("knowledge")

documents = load_knowledge_base(knowledge_path)

for document in documents:
    print("=" * 50)
    print("Fonte:", document["source"])
    print(document["text"])