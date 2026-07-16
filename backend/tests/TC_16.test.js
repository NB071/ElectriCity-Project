/**
 * TC_16 - Chatbot Service - Q&A and Navigation
 * UC20
 *
 * Expected: FAQ answers for selected questions; links/topics for navigation.
 * Notes: scripted FAQ dictionary rather than free-form AI for this UC path.
 */
import { executeTool } from "../services/chatbot/toolExecutor.js";
import { getDeclarationsForTemplate } from "../services/chatbot/strategies/index.js";
import chatbotService from "../services/chatbot/chatbot.service.js";

describe("TC_16 Chatbot Service - Q&A and Navigation (UC20)", () => {
    test("general-support template exposes get_store_faq tool", () => {
        const tools = getDeclarationsForTemplate(
            chatbotService.TEMPLATES.GENERAL_SUPPORT,
        ).map((d) => d.name);
        expect(tools).toContain("get_store_faq");
    });

    test("FAQ topic lookup returns a scripted answer", async () => {
        const byTopic = await executeTool("get_store_faq", {
            topic: "finding_products",
        });
        expect(byTopic.title).toMatch(/Finding products/i);
        expect(byTopic.answer || byTopic.body || byTopic.content).toBeTruthy();
    });

    test("FAQ query can guide the user to account/login related content", async () => {
        const byQuery = await executeTool("get_store_faq", {
            query: "how do I login to my account",
        });
        expect(byQuery.title || byQuery.matches?.length > 0).toBeTruthy();
    });
});
