import { create } from "zustand";
import { CHAT_WELCOME } from "@/components/shop/chatbot/chat-constants";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
};

const WELCOME_MESSAGE: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: CHAT_WELCOME,
    createdAt: new Date(0).toISOString(),
};

type ChatbotState = {
    messages: ChatMessage[];
    isSending: boolean;

    addMessage: (message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }) => void;
    setSending: (sending: boolean) => void;
    clear: () => void;
};

export const useChatbotStore = create<ChatbotState>((set) => ({
    messages: [WELCOME_MESSAGE],
    isSending: false,

    addMessage: (message) =>
        set((s) => ({
            messages: [
                ...s.messages,
                {
                    id: message.id ?? crypto.randomUUID(),
                    role: message.role,
                    content: message.content,
                    createdAt: new Date().toISOString(),
                },
            ],
        })),

    setSending: (sending) => set({ isSending: sending }),

    clear: () =>
        set({
            messages: [{ ...WELCOME_MESSAGE, createdAt: new Date().toISOString() }],
            isSending: false,
        }),
}));
