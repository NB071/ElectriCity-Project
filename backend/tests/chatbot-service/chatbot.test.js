// Chatbot service  tests

import chatbotService from "../../services/chatbot/chatbot.service.js";
import { getDeclarationsForTemplate } from "../../services/chatbot/strategies/index.js";
import executeTool from "../../services/chatbot/toolExecutor.js";

async function testProductInquiryTools() {
    const tools = getDeclarationsForTemplate(
        chatbotService.TEMPLATES.PRODUCT_INQUIRY,
    ).map((declaration) => declaration.name);

    console.assert(
        tools.includes("browse_vehicles"),
        "browse_vehicles tool missing",
    );
    console.log("[PASS] product-inquiry tools");
}

async function testGeneralSupportTools() {
    const tools = getDeclarationsForTemplate(
        chatbotService.TEMPLATES.GENERAL_SUPPORT,
    ).map((declaration) => declaration.name);

    console.assert(
        tools.includes("get_store_faq"),
        "get_store_faq tool missing for general-support",
    );
    console.log("[PASS] general-support tools");
}

async function testExecuteStoreFaqTool() {
    const byTopic = await executeTool("get_store_faq", {
        topic: "finding_products",
    });

    console.assert(
        byTopic.title === "Finding products on the website",
        "FAQ topic lookup failed",
    );

    const byQuery = await executeTool("get_store_faq", {
        query: "how do I login to my account",
    });

    console.assert(
        byQuery.title || byQuery.matches?.length > 0,
        "FAQ query lookup failed",
    );

    const deleteAccount = await executeTool("get_store_faq", {
        query: "how can I delete my account",
    });

    console.assert(
        deleteAccount.topic === "account_management" ||
            deleteAccount.title === "Account management and profile",
        "FAQ delete-account lookup failed",
    );

    console.log("[PASS] executeTool get_store_faq");
}

async function testInvalidToolArgsReturnSoftError() {
    const result = await executeTool("search_vehicles", {});

    console.assert(
        result.error?.code === "VALIDATION_ERROR",
        "invalid tool args should return encoded validation error",
    );
    console.log("[PASS] executeTool invalid args soft error");
}

async function testEncodeToolResultSummary() {
    const { encodeToolResult } = await import(
        "../../services/chatbot/promptValidator.js"
    );
    const { aiConfig } = await import("../../configs/ai.js");

    const originalLimit = aiConfig.maxToolResultChars;
    aiConfig.maxToolResultChars = 80;

    const result = encodeToolResult({
        items: Array.from({ length: 25 }, (_, index) => ({
            id: index + 1,
            name: `Vehicle ${index + 1}`,
        })),
        page: 1,
    });

    aiConfig.maxToolResultChars = originalLimit;

    console.assert(result.truncated === true, "expected truncated summary");
    console.assert(result.items_count === 25, "expected items_count in summary");
    console.assert(
        result.preview === undefined,
        "truncated result should not include raw JSON preview",
    );
    console.log("[PASS] encodeToolResult summary");
}

async function testExecuteBrowseTool() {
    try {
        const result = await executeTool("browse_vehicles", {
            price_max: 999999,
            limit: 2,
        });

        console.assert(Array.isArray(result.items), "browse items missing");
        console.log("[PASS] executeTool browse_vehicles");
    } catch (error) {
        if (error.code === "DATABASE_ERROR") {
            console.log(
                "[SKIP] executeTool browse_vehicles (database unavailable)",
            );
            return;
        }

        throw error;
    }
}

async function run() {
    await testProductInquiryTools();
    await testGeneralSupportTools();
    await testInvalidToolArgsReturnSoftError();
    await testEncodeToolResultSummary();
    await testExecuteStoreFaqTool();
    await testExecuteBrowseTool();
    console.log("Chatbot smoke tests passed.");
}

run().catch((error) => {
    console.error("Chatbot smoke tests failed:", error);
    process.exit(1);
});
