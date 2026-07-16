/**
 * TC_12 - Review Service - Write and Publish Reviews
 * UC16
 *
 * Expected: authenticated customer publishes rating/title/body; public catalog
 * list shows it; the author's "my reviews" list also includes it with catalog_item.
 */
import reviewService from "../services/review/review.service.js";
import { registerCustomer, ACTIVE_CID } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_12 Review Service - Write and Publish Reviews (UC16)", () => {
    test("signed-in customer can publish a review visible on the catalog item", async () => {
        const { user } = await registerCustomer("tc12");

        try {
            const created = await reviewService.publishReview({
                userId: user.user_id,
                cid: ACTIVE_CID,
                title: "TC12 Great EV",
                body: "Published via TC_12 Jest case.",
                rating: 5,
            });

            expect(created.review_id).toBeGreaterThan(0);
            expect(created.rating).toBe(5);

            const { items } = await reviewService.viewCatalogReviews(ACTIVE_CID, {
                limit: 50,
            });
            const match = items.find((r) => r.review_id === created.review_id);
            expect(match).toBeTruthy();
            expect(match.title).toBe("TC12 Great EV");
            expect(match.body).toMatch(/TC_12/);
            expect(match.author.user_id).toBe(user.user_id);
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("published review appears on the customer's own reviews list", async () => {
        const { user } = await registerCustomer("tc12-mine");

        try {
            const created = await reviewService.publishReview({
                userId: user.user_id,
                cid: ACTIVE_CID,
                title: "TC12 My Reviews",
                body: "Should appear on the customer dashboard reviews list.",
                rating: 4,
            });

            const mine = await reviewService.viewCustomerReviews(user.user_id, {
                page: 1,
                limit: 20,
            });

            const match = mine.items.find((r) => r.review_id === created.review_id);
            expect(match).toBeTruthy();
            expect(match.title).toBe("TC12 My Reviews");
            expect(match.rating).toBe(4);
            expect(match.catalog_item).toBeTruthy();
            expect(
                match.catalog_item.cid === ACTIVE_CID ||
                    match.catalog_item.id === ACTIVE_CID,
            ).toBe(true);
        } finally {
            await cleanupUser(user.user_id);
        }
    });

    test("unauthenticated users can still read catalog reviews", async () => {
        const { items } = await reviewService.viewCatalogReviews(ACTIVE_CID, {
            limit: 10,
        });
        expect(Array.isArray(items)).toBe(true);
    });
});
