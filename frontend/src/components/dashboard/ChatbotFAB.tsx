import { Link } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatbotFAB() {
    return (
        <Button
            asChild
            className="fixed right-12 bottom-12 z-40 h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            size="icon"
        >
            <Link to="/chatbot" className="flex items-center justify-center">
                <Bot className="size-6" />
                <span className="sr-only">Open Chatbot</span>
            </Link>
        </Button>
    );
}
