def split_text_into_chunks(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100
) -> list[str]:
    """
    Divide um texto em chunks com sobreposição.

    chunk_size:
        quantidade máxima aproximada de caracteres por chunk.

    overlap:
        quantidade de caracteres repetidos entre um chunk e outro.
    """

    if not text:
        return []

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks