import json
from pathlib import Path

import faiss
import numpy as np

from app.rag.embeddings import EmbeddingModel


class Retriever:

    def __init__(
        self,
        chunks: list[dict] | None = None,
        index=None
    ):
        self.chunks = chunks or []
        self.embedding_model = EmbeddingModel()
        self.index = index

        if self.index is None and self.chunks:
            self._build_index()

    def _build_index(self):
        texts = [
            chunk["text"]
            for chunk in self.chunks
        ]

        embeddings = self.embedding_model.encode(
            texts
        )

        embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(
            dimension
        )

        self.index.add(
            embeddings
        )

    def search(
        self,
        question: str,
        top_k: int = 3
    ) -> list[dict]:

        if not question.strip():
            return []

        if not self.chunks:
            return []

        if self.index is None:
            return []

        top_k = min(
            top_k,
            len(self.chunks)
        )

        question_embedding = (
            self.embedding_model.encode(
                [question]
            )
        )

        question_embedding = np.asarray(
            question_embedding,
            dtype="float32"
        )

        scores, indices = self.index.search(
            question_embedding,
            top_k
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0]
        ):
            if index < 0:
                continue

            chunk = self.chunks[index]

            results.append(
                {
                    "text": chunk["text"],
                    "source": chunk["source"],
                    "score": float(score)
                }
            )

        return results

    def save(
        self,
        directory: Path
    ):
        directory.mkdir(
            parents=True,
            exist_ok=True
        )

        index_path = (
            directory
            / "index.faiss"
        )

        metadata_path = (
            directory
            / "metadata.json"
        )

        faiss.write_index(
            self.index,
            str(index_path)
        )

        with open(
            metadata_path,
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                self.chunks,
                file,
                ensure_ascii=False,
                indent=2
            )

    @classmethod
    def load(
        cls,
        directory: Path
    ):

        index_path = (
            directory
            / "index.faiss"
        )

        metadata_path = (
            directory
            / "metadata.json"
        )

        if not index_path.exists():
            raise FileNotFoundError(
                "Índice FAISS não encontrado."
            )

        if not metadata_path.exists():
            raise FileNotFoundError(
                "Metadata do índice não encontrada."
            )

        index = faiss.read_index(
            str(index_path)
        )

        with open(
            metadata_path,
            "r",
            encoding="utf-8"
        ) as file:
            chunks = json.load(file)

        return cls(
            chunks=chunks,
            index=index
        )