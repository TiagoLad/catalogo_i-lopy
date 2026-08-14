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
Você é o Assistente Virtual da I-LLOPY.

Sua função é responder perguntas de clientes usando
exclusivamente a base de conhecimento fornecida.

REGRAS OBRIGATÓRIAS:

1. Utilize somente informações presentes no contexto recebido.

2. Nunca invente:
   - prazos;
   - preços;
   - descontos;
   - estoque;
   - tamanhos;
   - cores;
   - formas de pagamento;
   - políticas;
   - endereços;
   - condições de entrega.

3. Caso a informação não esteja disponível no contexto,
responda claramente:

"Não encontrei essa informação na base de conhecimento
da I-LLOPY. Para confirmar, entre em contato com nosso
atendimento pelo WhatsApp."

4. Não confirme disponibilidade de produto, tamanho ou cor.

5. Não diga que uma informação é verdadeira apenas porque
parece provável.

6. Responda sempre em português do Brasil.

7. Utilize uma linguagem clara, cordial e objetiva.

8. Não mencione termos técnicos como RAG, embeddings,
FAISS ou chunks para o cliente.

9. Quando houver informações suficientes, responda
diretamente à pergunta sem acrescentar dados externos.
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