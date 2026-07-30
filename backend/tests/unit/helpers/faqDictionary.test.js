import {
    FAQ_TOPICS,
    searchFaqByQuery,
    lookupStoreFaq,
} from "../../../services/chatbot/faqDictionary.js";

describe("faqDictionary", () => {
    test("searchFaqByQuery returns empty for blank query", () => {
        expect(searchFaqByQuery()).toEqual([]);
        expect(searchFaqByQuery("   ")).toEqual([]);
        expect(searchFaqByQuery(null)).toEqual([]);
    });

    test("searchFaqByQuery returns best keyword match", () => {
        const matches = searchFaqByQuery("How do I use the wishlist?");
        expect(matches).toHaveLength(1);
        expect(matches[0].topic).toBe(FAQ_TOPICS.WISHLIST);
    });

    test("searchFaqByQuery returns empty when nothing matches", () => {
        expect(searchFaqByQuery("zzzz-not-a-real-faq-term")).toEqual([]);
    });

    test("lookupStoreFaq returns topic entry", () => {
        const entry = lookupStoreFaq({ topic: FAQ_TOPICS.CART });
        expect(entry.topic).toBe(FAQ_TOPICS.CART);
        expect(entry.answer).toEqual(expect.any(String));
    });

    test("lookupStoreFaq returns NOT_FOUND for unknown topic", () => {
        const result = lookupStoreFaq({ topic: "not_a_topic" });
        expect(result.error.code).toBe("NOT_FOUND");
        expect(result.error.available_topics).toEqual(
            expect.arrayContaining([FAQ_TOPICS.CART]),
        );
    });

    test("lookupStoreFaq returns NOT_FOUND when query has no match", () => {
        const result = lookupStoreFaq({ query: "xyzzy-no-match" });
        expect(result.error).toMatchObject({
            code: "NOT_FOUND",
            message: "No FAQ entry matched that question.",
        });
    });

    test("lookupStoreFaq returns match from query and defaults", () => {
        const result = lookupStoreFaq({ query: "payment methods" });
        expect(result.topic).toBe(FAQ_TOPICS.PAYMENTS);
        expect(lookupStoreFaq()).toMatchObject({
            error: { code: "NOT_FOUND" },
        });
    });
});
