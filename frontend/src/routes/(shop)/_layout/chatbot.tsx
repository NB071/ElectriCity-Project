import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import Typewriter from "@/components/common/Typewriter";
import ChatbotPrompt from "@/components/shop/chatbot/ChatbotPrompt";
import { CHAT_SUGGESTIONS, CHAT_WELCOME } from "@/components/shop/chatbot/chat-constants";
import ChatMessageList from "@/components/shop/chatbot/ChatMessageList";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useChatSend, type ChatTemplate } from "@/hooks/api/chatbot/use-chat";
import { Button } from "@/components/ui/button";
import { Bot, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/(shop)/_layout/chatbot")({
    component: Chatbot,
});

function Chatbot() {
    const messages = useChatbotStore((s) => s.messages);
    const isSending = useChatbotStore((s) => s.isSending);
    const addMessage = useChatbotStore((s) => s.addMessage);
    const setSending = useChatbotStore((s) => s.setSending);
    const clear = useChatbotStore((s) => s.clear);
    const chatSend = useChatSend();

    const hasConversation = messages.some((m) => m.role === "user");

    const handleSubmit = async (prompt: string, template: ChatTemplate) => {
        if (isSending) return;

        addMessage({ role: "user", content: prompt });
        setSending(true);

        try {
            const result = await chatSend.mutateAsync({
                body: { template, userMessage: prompt },
            });
            addMessage({ role: "assistant", content: result.reply });
        } catch (error) {
            addMessage({
                role: "assistant",
                content: error instanceof Error ? error.message : "Something went wrong. Please try again.",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-background relative flex min-h-dvh flex-col py-16">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-radial-[ellipse_at_top] from-[oklch(0.488_0.243_264.376/0.08)] to-transparent"
            />

            <div className="border-border/60 bg-background/80 sticky top-16 z-20 border-b backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
                    <div className="min-w-0">
                        <Breadcrumbs />
                        <div className="mt-6 flex items-start gap-2">
                            <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full">
                                <Bot className="size-3.5" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold tracking-tight">ElectriCity Assistant</p>
                                <p className="text-muted-foreground truncate text-[11px]">Vehicles · cart · support</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-auto shrink-0 gap-1.5 rounded-full"
                        disabled={isSending || !hasConversation}
                        onClick={() => clear()}
                    >
                        <RotateCcw className="size-3.5" />
                        New chat
                    </Button>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
                {!hasConversation ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
                        <div className="space-y-3">
                            <h1 className="font-heading text-foreground text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                Your personal EV assistant
                            </h1>
                            <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed text-balance sm:text-base">
                                Ask about vehicles and customizations, get cart help, or general support. Pick a mode below, then type.
                            </p>
                        </div>

                        <div className="flex w-full max-w-xl flex-col items-center gap-4">
                            <div className="flex w-full items-start gap-2.5 text-left sm:gap-3">
                                <div className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                                    <Bot className="size-4" />
                                </div>
                                <div className="bg-muted border-border/60 rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm leading-relaxed">
                                    <Typewriter text={CHAT_WELCOME} speed={28} />
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap justify-center gap-2">
                                {CHAT_SUGGESTIONS.map((suggestion) => (
                                    <Button
                                        key={suggestion.label}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-auto max-w-full rounded-full px-3 py-1.5 text-left text-xs whitespace-normal"
                                        disabled={isSending}
                                        onClick={() => handleSubmit(suggestion.prompt, suggestion.template)}
                                    >
                                        {suggestion.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <ChatMessageList />
                )}
            </div>

            <div className="border-border/60 bg-background/90 sticky bottom-0 z-20 border-t backdrop-blur-md">
                <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
                    <ChatbotPrompt onSubmit={handleSubmit} isSending={isSending} />
                </div>
            </div>
        </div>
    );
}
