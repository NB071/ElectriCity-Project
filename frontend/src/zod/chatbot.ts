import { z } from "zod";

export const CHAT_USER_MESSAGE = {
    MIN: 1,
    MAX: 2000,
} as const;

export const chatTemplateSchema = z.enum(["product-inquiry", "cart-assist", "general-support"]);

export const chatUserPromptSchema = z.object({
    userMessage: z
        .string({ error: "Message is required" })
        .trim()
        .min(CHAT_USER_MESSAGE.MIN, "Message cannot be blank")
        .max(CHAT_USER_MESSAGE.MAX, `Message cannot exceed ${CHAT_USER_MESSAGE.MAX} characters`),
    template: chatTemplateSchema,
});

export type ChatUserPromptValues = z.infer<typeof chatUserPromptSchema>;
export type ChatTemplate = z.infer<typeof chatTemplateSchema>;
