import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Typewriter from "@/components/common/Typewriter";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores/chatbot-store";

export default function ChatMessageList() {
    const messages = useChatbotStore((s) => s.messages);
    const isSending = useChatbotStore((s) => s.isSending);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

    const lastMessage = messages.at(-1);
    const lastAssistantId = lastMessage?.role === "assistant" ? lastMessage.id : null;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages.length, isSending, lastAssistantId]);

    useEffect(() => {
        if (!lastAssistantId || lastMessage?.role !== "assistant") return;

        const durationMs = lastMessage.content.length * 18 + 250;
        const id = window.setInterval(() => {
            bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
        }, 120);
        const stop = window.setTimeout(() => window.clearInterval(id), durationMs);

        return () => {
            window.clearInterval(id);
            window.clearTimeout(stop);
        };
    }, [lastAssistantId, lastMessage]);

    return (
        <div ref={scrollerRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-4 sm:px-2">
            {messages.map((message, index) => {
                const isUser = message.role === "user";
                const isLatestAssistant = !isUser && index === messages.length - 1;

                return (
                    <div key={message.id} className={cn("flex items-end gap-2.5 sm:items-start sm:gap-3", isUser && "flex-row-reverse")}>
                        <Avatar className="size-8 shrink-0">
                            <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                "max-w-[min(100%,36rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                                isUser
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-muted text-foreground border-border/60 rounded-bl-md border"
                            )}
                        >
                            {isLatestAssistant ? <Typewriter text={message.content} speed={18} /> : message.content}
                        </div>
                    </div>
                );
            })}

            {isSending && (
                <div className="flex items-end gap-2.5 sm:items-start sm:gap-3" aria-live="polite" aria-label="Assistant is typing">
                    <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-muted">
                            <Bot className="size-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted border-border/60 rounded-2xl rounded-bl-md border px-4 py-3">
                        <span className="flex gap-1">
                            <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                            <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                            <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full" />
                        </span>
                    </div>
                </div>
            )}

            <div ref={bottomRef} className="h-px shrink-0" />
        </div>
    );
}
