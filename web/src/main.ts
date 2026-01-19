const BACKEND_URL = "/api/chat/chat";

const chatContainer = document.getElementById("chat-container")!;
const chatInput = document.getElementById("chat-input") as HTMLInputElement;
const sendButton = document.getElementById("send-button")!;
const typingTemplate = document.getElementById("typing-indicator-template") as HTMLTemplateElement;

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };
type BackendChatResponse = {
    content?: string;
    message?: string;
    error?: string;
};

const SESSION_STORAGE_KEY = "appointment-chat-session-id";

const MOBILE_USER_AGENT_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const updateDeviceProfile = (): boolean => {
    const nav = navigator.userAgent || navigator.vendor || "";
    const hasCoarsePointer = typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : false;
    const isMobile = hasCoarsePointer || MOBILE_USER_AGENT_REGEX.test(nav);
    document.documentElement.dataset.device = isMobile ? "mobile" : "desktop";
    return isMobile;
};

const initDeviceDetection = () => {
    let timeoutId: number | undefined;

    const scheduleUpdate = () => {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
            updateDeviceProfile();
        }, 200);
    };

    updateDeviceProfile();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
};

const generateSessionId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    // Fallback simples para navegadores sem crypto.randomUUID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};

const getSessionId = (): string => {
    try {
        const storedId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedId) {
            return storedId;
        }

        const newId = generateSessionId();
        sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
        return newId;
    } catch {
        // sessionStorage pode não estar disponível em alguns contextos
        return generateSessionId();
    }
};

const chatMessages: ChatMessage[] = [];

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
    chatMessages.push({ role: "user", content: userMessage });
    addMessage("user", userMessage);
    chatInput.value = "";

    // Exibe indicador de digitação
    const typingIndicator = showTypingIndicator();

    try {
        const payload = {
            session_id: getSessionId(),
            message: userMessage,
        };

        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorPayload = await response.text();
            throw new Error(errorPayload || `Erro HTTP ${response.status}`);
        }

        const data: BackendChatResponse = await response.json();
        const assistantMessage = data.content ?? data.message;

        if (!assistantMessage) {
            throw new Error("Resposta inválida do backend.");
        }

        chatMessages.push({ role: "assistant", content: assistantMessage });
        addMessage("assistant", assistantMessage);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        addMessage("assistant", `Erro ao conectar ao backend: ${errorMessage}`);
    } finally {
        typingIndicator.remove();
    }
}

initDeviceDetection();

sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
