"use strict";
const BACKEND_URL = "http://localhost:8000/chat";
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const typingTemplate = document.getElementById("typing-indicator-template");
let messages = [];
function addMessage(role, content) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", role);
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
function showTypingIndicator() {
    const typingNode = typingTemplate.content.cloneNode(true);
    const container = document.createElement("div");
    container.classList.add("typing-wrapper");
    container.appendChild(typingNode);
    chatContainer.appendChild(container);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return container;
}
async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage)
        return;
    // Adiciona a mensagem do usuário
    messages.push({ role: "user", content: userMessage });
    addMessage("user", userMessage);
    chatInput.value = "";
    // Exibe indicador de digitação
    const typingIndicator = showTypingIndicator();
    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
        });
        const data = await response.json();
        const assistantMessage = data.content;
        // Remove indicador de digitação
        typingIndicator.remove();
        // Adiciona resposta do assistente
        messages.push({ role: "assistant", content: assistantMessage });
        addMessage("assistant", assistantMessage);
    }
    catch (err) {
        typingIndicator.remove();
        addMessage("assistant", `Erro ao conectar ao backend: ${err}`);
    }
}
sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
        sendMessage();
});
