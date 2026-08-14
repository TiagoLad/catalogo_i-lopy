import faiss
import numpy as np

from app.rag.embeddings import EmbeddingModel


class Retriever:

    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        self.embedding_model = EmbeddingModel()

        texts = [chunk["text"] for chunk in chunks]

        embeddings = self.embedding_model.encode(texts)

        embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)


    def search(
        self,
        question: str,
        top_k: int = 3
    ) -> list[dict]:

        question_embedding = self.embedding_model.encode(
            [question]
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
            if index == -1:
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