from pathlib import Path

from pypdf import PdfReader


def load_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


def load_knowledge_base(directory: Path) -> list[dict]:
    documents = []

    for pdf_file in directory.glob("*.pdf"):
        text = load_pdf(pdf_file)

        documents.append(
            {
                "source": pdf_file.name,
                "text": text
            }
        )

    return documents