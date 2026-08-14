import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


class LLMClient:

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY não foi configurada."
            )

        if not model:
            raise RuntimeError(
                "GEMINI_MODEL não foi configurado."
            )

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = model

    def generate(
        self,
        question: str,
        context: str
    ) -> str:

        system_instruction = """
Você é o assistente virtual da loja I-LLOPY.

Sua função é responder dúvidas dos clientes utilizando
exclusivamente as informações fornecidas pela base de conhecimento.

Regras:

1. Não invente informações.
2. Não utilize conhecimento externo ao contexto fornecido.
3. Responda em português do Brasil.
4. Seja claro, educado e objetivo.
5. Não invente prazos, preços, condições de troca,
   formas de pagamento ou políticas.
6. Se a resposta não estiver no contexto,
   informe que não encontrou essa informação
   na base de conhecimento da I-LLOPY.
"""

        prompt = f"""
CONTEXTO DA BASE DE CONHECIMENTO:

{context}

PERGUNTA DO CLIENTE:

{question}

Responda à pergunta utilizando somente
as informações presentes no contexto.
"""

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
            ),
        )

        if not response.text:
            return (
                "Não foi possível gerar uma resposta "
                "com base nas informações disponíveis."
            )

        return response.text