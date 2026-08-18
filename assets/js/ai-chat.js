const ILOPY_AI_API = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    const chatButton = document.getElementById("ai-chat-button");
    const chatWindow = document.getElementById("ai-chat-window");
    const closeButton = document.getElementById("ai-chat-close");

    const form = document.getElementById("ai-chat-form");
    const input = document.getElementById("ai-chat-input");
    const submitButton = document.getElementById("ai-chat-submit");

    const messages = document.getElementById("ai-chat-messages");
    const suggestions = document.getElementById("ai-chat-suggestions");

    let isSending = false;

    chatButton.addEventListener("click", () => {
        chatWindow.classList.toggle("ai-chat-open");

        if (chatWindow.classList.contains("ai-chat-open")) {
            input.focus();
        }
    });

    closeButton.addEventListener("click", () => {
        chatWindow.classList.remove("ai-chat-open");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        await sendQuestion(input.value);
    });

    if (suggestions) {
        suggestions.addEventListener("click", async (event) => {
            const button = event.target.closest("button");

            if (!button) {
                return;
            }

            const question = button.dataset.question;

            if (!question) {
                return;
            }

            await sendQuestion(question);
        });
    }

    async function sendQuestion(question) {
        question = question.trim();

        if (!question || isSending) {
            return;
        }

        isSending = true;

        input.value = "";

        setFormState(true);

        addMessage(
            question,
            "user"
        );

        if (suggestions) {
            suggestions.remove();
        }

        const typingMessage = addTypingIndicator();

        try {
            const response = await fetch(
                `${ILOPY_AI_API}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        question: question
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Erro HTTP ${response.status}`
                );
            }

            const data = await response.json();

            typingMessage.remove();

            addMessage(
                data.answer,
                "assistant",
                data.sources || []
            );

        } catch (error) {
            typingMessage.remove();

            addMessage(
                "Não consegui consultar o assistente agora. Tente novamente em alguns instantes.",
                "assistant"
            );

            console.error(
                "Erro no assistente I-LLOPY:",
                error
            );

        } finally {
            isSending = false;

            setFormState(false);

            input.focus();
        }
    }

    function setFormState(disabled) {
        input.disabled = disabled;
        submitButton.disabled = disabled;
    }

    function addMessage(
        text,
        type,
        sources = []
    ) {
        const message = document.createElement("div");

        message.classList.add(
            "ai-chat-message",
            `ai-chat-${type}`
        );

        const content = document.createElement("div");

        content.className =
            "ai-chat-message-content";

        content.textContent = text;

        message.appendChild(content);

        if (sources.length > 0) {
            const sourceElement =
                document.createElement("small");

            sourceElement.className =
                "ai-chat-source";

            sourceElement.textContent =
                `Fonte: ${formatSources(sources)}`;

            message.appendChild(
                sourceElement
            );
        }

        messages.appendChild(message);

        scrollToBottom();

        return message;
    }

    function addTypingIndicator() {
        const message =
            document.createElement("div");

        message.classList.add(
            "ai-chat-message",
            "ai-chat-assistant"
        );

        const content =
            document.createElement("div");

        content.className =
            "ai-chat-message-content";

        const typing =
            document.createElement("div");

        typing.className =
            "ai-chat-typing";

        typing.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        content.appendChild(typing);
        message.appendChild(content);

        messages.appendChild(message);

        scrollToBottom();

        return message;
    }

    function formatSources(sources) {
        return sources
            .map(formatSourceName)
            .join(", ");
    }

    function formatSourceName(source) {
        const sourceMap = {
            "trocas_devolucoes_ilopy.pdf":
                "Política de Trocas e Devoluções",

            "faq_ilopy.pdf":
                "Perguntas Frequentes",

            "politica_privacidade_ilopy.pdf":
                "Política de Privacidade",

            "envios_entregas_ilopy.pdf":
                "Envios e Entregas",

            "formas_pagamento_ilopy.pdf":
                "Formas de Pagamento",

            "termos_condicoes_ilopy.pdf":
                "Termos e Condições"
        };

        return sourceMap[source] || source;
    }

    function scrollToBottom() {
        messages.scrollTop =
            messages.scrollHeight;
    }
});