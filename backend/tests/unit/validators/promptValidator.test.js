import { ValidationError } from "../../../utils/errors.js";
import {
    validateChatPrompt,
    validateToolArgs,
    encodeToolResult,
} from "../../../services/chatbot/promptValidator.js";
import {
    TEMPLATES,
    TOOLS,
    VALIDATIONS,
} from "../../../services/chatbot/constants.js";
import { aiConfig } from "../../../configs/ai.js";

describe("promptValidator", () => {
    describe("validateChatPrompt", () => {
        test("general-support happy path with defaults", () => {
            const data = validateChatPrompt({
                template: TEMPLATES.GENERAL_SUPPORT,
                userMessage: "How do I checkout?",
            });

            expect(data.template).toBe(TEMPLATES.GENERAL_SUPPORT);
            expect(data.vars).toEqual({});
            expect(data.context).toEqual([]);
        });

        test("product-inquiry accepts optional vars and context", () => {
            const data = validateChatPrompt({
                template: TEMPLATES.PRODUCT_INQUIRY,
                userMessage: "Tell me about Model 3",
                vars: { cid: "12", model_name: "Model 3", base_price: "45000" },
                context: ["User viewed catalog page"],
            });

            expect(data.vars.cid).toBe(12);
            expect(data.vars.base_price).toBe(45000);
            expect(data.context).toHaveLength(1);
        });

        test("cart-assist accepts cart vars", () => {
            const data = validateChatPrompt({
                template: TEMPLATES.CART_ASSIST,
                userMessage: "What is in my cart?",
                vars: { cart_id: 5, item_count: 2 },
            });

            expect(data.vars.cart_id).toBe(5);
            expect(data.vars.item_count).toBe(2);
        });

        test("rejects unknown template / blank message / bad context", () => {
            expect(() =>
                validateChatPrompt({
                    template: "nope",
                    userMessage: "hi",
                }),
            ).toThrow(ValidationError);

            expect(() =>
                validateChatPrompt({
                    template: TEMPLATES.GENERAL_SUPPORT,
                    userMessage: "",
                }),
            ).toThrow(ValidationError);

            expect(() =>
                validateChatPrompt({
                    template: TEMPLATES.GENERAL_SUPPORT,
                    userMessage: "hi",
                    context: [""],
                }),
            ).toThrow(ValidationError);
        });

        test("rejects message longer than USER_MESSAGE.MAX", () => {
            expect(() =>
                validateChatPrompt({
                    template: TEMPLATES.GENERAL_SUPPORT,
                    userMessage: "x".repeat(VALIDATIONS.USER_MESSAGE.MAX + 1),
                }),
            ).toThrow(ValidationError);
        });

        test("rejects invalid product-inquiry vars", () => {
            expect(() =>
                validateChatPrompt({
                    template: TEMPLATES.PRODUCT_INQUIRY,
                    userMessage: "price?",
                    vars: { base_price: -1 },
                }),
            ).toThrow(ValidationError);
        });
    });

    describe("validateToolArgs", () => {
        test("rejects unknown tool name", () => {
            expect(() => validateToolArgs("invent_vehicles", {})).toThrow(
                ValidationError,
            );
        });

        test("browse_vehicles accepts filters and coerces numbers", () => {
            const args = validateToolArgs(TOOLS.BROWSE_VEHICLES, {
                brand_id: "3",
                condition: "new",
                price_min: "10000",
                sort: "price_asc",
                page: "1",
                limit: "5",
            });

            expect(args.brand_id).toBe(3);
            expect(args.price_min).toBe(10000);
            expect(args.page).toBe(1);
            expect(args.limit).toBe(5);
        });

        test("search_vehicles requires non-blank q", () => {
            expect(() =>
                validateToolArgs(TOOLS.SEARCH_VEHICLES, {}),
            ).toThrow(ValidationError);

            expect(() =>
                validateToolArgs(TOOLS.SEARCH_VEHICLES, { q: "" }),
            ).toThrow(ValidationError);

            const args = validateToolArgs(TOOLS.SEARCH_VEHICLES, {
                q: "Tesla",
            });
            expect(args.q).toBe("Tesla");
        });

        test("get_vehicle_details requires cid or model_name", () => {
            expect(() =>
                validateToolArgs(TOOLS.GET_VEHICLE_DETAILS, {}),
            ).toThrow(ValidationError);

            expect(
                validateToolArgs(TOOLS.GET_VEHICLE_DETAILS, { cid: 9 }).cid,
            ).toBe(9);
            expect(
                validateToolArgs(TOOLS.GET_CUSTOMIZATION_OPTIONS, {
                    model_name: "Model Y",
                    brand_name: "Tesla",
                }).model_name,
            ).toBe("Model Y");
        });

        test("compare_vehicles enforces min and max vehicle count", () => {
            expect(() =>
                validateToolArgs(TOOLS.COMPARE_VEHICLES, { cids: [1] }),
            ).toThrow(ValidationError);

            expect(() =>
                validateToolArgs(TOOLS.COMPARE_VEHICLES, {
                    cids: [1, 2, 3, 4, 5, 6],
                }),
            ).toThrow(ValidationError);

            const args = validateToolArgs(TOOLS.COMPARE_VEHICLES, {
                cids: [1],
                models: [{ model_name: "Leaf" }],
            });
            expect(args.cids).toEqual([1]);
            expect(args.models).toHaveLength(1);
        });

        test("get_store_faq requires topic or query", () => {
            expect(() =>
                validateToolArgs(TOOLS.GET_STORE_FAQ, {}),
            ).toThrow(ValidationError);

            const byQuery = validateToolArgs(TOOLS.GET_STORE_FAQ, {
                query: "checkout",
            });
            expect(byQuery.query).toBe("checkout");
        });
    });

    describe("encodeToolResult", () => {
        test("returns parsed object when under size limit", () => {
            const result = encodeToolResult({ items: [1, 2], topic: "cart" });
            expect(result).toEqual({ items: [1, 2], topic: "cart" });
        });

        test("returns empty object for nullish input under limit", () => {
            expect(encodeToolResult(null)).toEqual({});
            expect(encodeToolResult(undefined)).toEqual({});
        });

        test("summarizes oversized results", () => {
            const oversized = {
                items: Array.from({ length: 50 }, (_, i) => ({
                    id: i,
                    name: `Vehicle ${i}`,
                    description: "x".repeat(200),
                })),
                topic: "browse",
                title: "Results",
                answer: "y".repeat(300),
            };

            // Force truncation path even if config threshold is high.
            const original = aiConfig.maxToolResultChars;
            aiConfig.maxToolResultChars = 100;
            try {
                const encoded = encodeToolResult(oversized);
                expect(encoded.truncated).toBe(true);
                expect(encoded.items_count).toBe(50);
                expect(encoded.topic).toBe("browse");
                expect(encoded.title).toBe("Results");
                expect(encoded.answer_preview).toMatch(/\.\.\.$/);
                expect(encoded.original_size_chars).toBeGreaterThan(100);
            } finally {
                aiConfig.maxToolResultChars = original;
            }
        });
    });
});
