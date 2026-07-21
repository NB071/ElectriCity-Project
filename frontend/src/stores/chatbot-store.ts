import { create } from "zustand";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
};

type ChatbotState = {
    messages: ChatMessage[];
    isSending: boolean;

    addMessage: (message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }) => void;
    setSending: (sending: boolean) => void;
    clear: () => void;
};

export const useChatbotStore = create<ChatbotState>((set) => ({
    messages: [
        {
            id: "welcome",
            role: "assistant",
            content: "Hi, ask me about vehicles, financing, or checkout.",
            createdAt: new Date(0).toISOString(),
        },
    ],
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
            messages: [],
            isSending: false,
        }),
}));
