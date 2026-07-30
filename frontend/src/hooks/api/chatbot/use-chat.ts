import { useApiMutation } from "@/hooks/use-api";

// Endpoints: [POST] /api/shop/chatbot/message

export type ChatTemplate = "product-inquiry" | "cart-assist" | "general-support";

export type ChatSendBody = {
    template: ChatTemplate;
    userMessage: string;
    vars?: Record<string, unknown>;
    context?: string[];
};

export type ChatSendResponse = {
    reply: string;
};

// Endpoints: [POST] /api/shop/chatbot/message
export const useChatSend = () => {
    return useApiMutation<ChatSendResponse, ChatSendBody>({
        url: "/api/shop/chatbot/message",
        method: "post",
    });
};
