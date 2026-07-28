import { createFileRoute } from "@tanstack/react-router";
import { StaticPageTemplate } from "@/components/common/StaticPageTemplate";
import ChatbotPrompt from "@/components/chatbot/ChatbotPrompt";
import ChatMessageList from "@/components/chatbot/ChatMessageList";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useChatSend, type ChatTemplate } from "@/hooks/api/chatbot/use-chat";

export const Route = createFileRoute("/(shop)/_layout/chatbot")({
    component: Chatbot,
});

function Chatbot() {
    const addMessage = useChatbotStore((s) => s.addMessage);
    const setSending = useChatbotStore((s) => s.setSending);
    const chatSend = useChatSend();

    const handleSubmit = async (prompt: string, template: string) => {
        addMessage({ role: "user", content: prompt });
        setSending(true);

        try {
            const result = await chatSend.mutateAsync({
                body: { template: template as ChatTemplate, userMessage: prompt },
            });
            addMessage({ role: "assistant", content: result.reply });
        } catch (error) {
            addMessage({
                role: "assistant",
                content: error instanceof Error ? error.message : "Something went wrong, please try again.",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <StaticPageTemplate title="ElectriCity AI Assistant">
            <div className="mx-auto w-full max-w-4xl pt-8 pb-16">
                <ChatMessageList />
                <ChatbotPrompt onSubmit={handleSubmit} />
            </div>
        </StaticPageTemplate>
    );
}
