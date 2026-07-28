import { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores/chatbot-store";

export default function ChatMessageList() {
    const messages = useChatbotStore((s) => s.messages);
    const isSending = useChatbotStore((s) => s.isSending);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, isSending]);

    return (
        <div className="flex flex-col gap-4 py-6">
            {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                    <div key={message.id} className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
                        <Avatar className="size-8 shrink-0">
                            <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                                isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"
                            )}
                        >
                            {message.content}
                        </div>
                    </div>
                );
            })}

            {isSending && (
                <div className="flex items-start gap-3">
                    <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="bg-muted">
                            <Bot className="size-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                        <span className="flex gap-1">
                            <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                            <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                            <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full" />
                        </span>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
