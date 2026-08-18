from app.rag.embeddings import EmbeddingModel


texts = [
    "Como funciona a troca de produtos?",
    "O cliente pode solicitar a troca conforme a política da loja.",
    "O prazo de entrega depende da modalidade de envio."
]


embedding_model = EmbeddingModel()

vectors = embedding_model.encode(texts)


print("Quantidade de textos:", len(texts))
print("Formato dos embeddings:", vectors.shape)

for index, vector in enumerate(vectors, start=1):
    print(f"Texto {index}: vetor com {len(vector)} dimensões")