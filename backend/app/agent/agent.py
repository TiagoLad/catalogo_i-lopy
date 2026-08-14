from pathlib import Path

from app.rag.retriever import Retriever
from app.llm.client import LLMClient


class IlopyAgent:

    def __init__(self):
        self.retriever = self._load_retriever()
        self.llm = LLMClient()

    def _load_retriever(self) -> Retriever:
        """
        Carrega o índice FAISS e os metadados
        previamente gerados pelo build_index.py.
        """

        backend_path = Path(__file__).resolve().parents[2]

        vector_store_path = (
            backend_path
            / "data"
            / "vector_store"
        )

        return Retriever.load(
            vector_store_path
        )

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
DOCUMENTO {index}

Fonte:
{result["source"]}

Conteúdo:
{result["text"]}
"""
            )

        context = "\n\n".join(
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