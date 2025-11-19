const BACKEND_URL = "http://localhost:8000/chat";

const chatContainer = document.getElementById("chat-container")!;
const chatInput = document.getElementById("chat-input") as HTMLInputElement;
const sendButton = document.getElementById("send-button")!;
const typingTemplate = document.getElementById("typing-indicator-template") as HTMLTemplateElement;

let messages: { role: string, content: string }[] = [];

// SVG ícones como strings
const botIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  <path d="M12 11v6"/>
  <path d="M8 15h.01"/>
  <path d="M16 15h.01"/>
  <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
</svg>`;

const userIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>`;

function addMessage(role: string, content: string) {
    // Remove welcome message se existir
    const welcome = chatContainer.querySelector('.chat-app__welcome');
    if (welcome) {
        welcome.classList.add('hidden');
    }

    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper", role);
    
    // Avatar com ícone
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("message-wrapper__avatar");
    avatarDiv.classList.add(role === "user" ? "message-wrapper__avatar--user" : "message-wrapper__avatar--bot");
    
    const avatarIcon = document.createElement("div");
    avatarIcon.classList.add("message-wrapper__avatar-icon");
    avatarIcon.innerHTML = role === "user" ? userIconSVG : botIconSVG;
    avatarDiv.appendChild(avatarIcon);
    
    // Mensagem
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", role);
    messageDiv.textContent = content;
    
    messageWrapper.appendChild(avatarDiv);
    messageWrapper.appendChild(messageDiv);
    
    chatContainer.appendChild(messageWrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    // Remove welcome message se existir
    const welcome = chatContainer.querySelector('.chat-app__welcome');
    if (welcome) {
        welcome.classList.add('hidden');
    }

    const typingNode = typingTemplate.content.cloneNode(true) as HTMLElement;
    const container = document.createElement("div");
    container.classList.add("typing-wrapper");
    
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("message-wrapper__avatar", "message-wrapper__avatar--bot");
    
    const avatarIcon = document.createElement("div");
    avatarIcon.classList.add("message-wrapper__avatar-icon");
    avatarIcon.innerHTML = botIconSVG;
    avatarDiv.appendChild(avatarIcon);
    
    container.appendChild(avatarDiv);
    container.appendChild(typingNode);
    
    chatContainer.appendChild(container);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return container;
}

async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

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

    } catch (err) {
        typingIndicator.remove();
        addMessage("assistant", `Erro ao conectar ao backend: ${err}`);
    }
}

sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
