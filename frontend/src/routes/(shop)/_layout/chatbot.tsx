import { createFileRoute } from "@tanstack/react-router";
import { StaticPageTemplate } from "@/components/common/StaticPageTemplate";
import ChatbotPrompt from "@/components/chatbot/ChatbotPrompt";

export const Route = createFileRoute("/(shop)/_layout/chatbot")({
    component: Chatbot,
});

function Chatbot() {
    return (
        <StaticPageTemplate title="ElectriCity AI Assistant">
            <div className="mx-auto w-full max-w-4xl pt-8 pb-16">
                <ChatbotPrompt />
            </div>
        </StaticPageTemplate>
    );
}
