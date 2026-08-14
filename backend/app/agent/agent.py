from pathlib import Path

from app.rag.loader import load_knowledge_base
from app.rag.chunker import split_text_into_chunks
from app.rag.retriever import Retriever
from app.llm.client import LLMClient


class IlopyAgent:

    def __init__(self):
        self.retriever = self._build_retriever()
        self.llm = LLMClient()

    def _build_retriever(self) -> Retriever:

        backend_path = Path(__file__).resolve().parents[2]

        knowledge_path = (
            backend_path
            / "knowledge"
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

        if not chunks:
            raise RuntimeError(
                "Nenhum conteúdo foi encontrado "
                "na base de conhecimento."
            )

        return Retriever(chunks)

    def answer(
        self,
        question: str,
        top_k: int = 3
    ) -> dict:

        question = question.strip()

        if not question:
            return {
                "answer": "Informe uma pergunta.",
                "sources": []
            }

        results = self.retriever.search(
            question,
            top_k=top_k
        )

        if not results:
            return {
                "answer": (
                    "Não encontrei informações "
                    "sobre essa pergunta na base "
                    "de conhecimento da I-LLOPY."
                ),
                "sources": []
            }

        context_parts = []

        for index, result in enumerate(
            results,
            start=1
        ):

            context_parts.append(
                f"""
Trecho {index}
Fonte: {result["source"]}

{result["text"]}
"""
            )

        context = "\n".join(
            context_parts
        )

        answer = self.llm.generate(
            question=question,
            context=context
        )

        sources = list(
            dict.fromkeys(
                result["source"]
                for result in results
            )
        )

        return {
            "answer": answer,
            "sources": sources
        }