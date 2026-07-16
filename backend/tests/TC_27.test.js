/**
 * TC_27 - Review Service - Admin Review Moderation
 * UC31
 *
 * Expected: admin can list/filter reviews and delete; deletion removes from public list.
 */
import reviewService from "../services/review/review.service.js";
import { NotFoundError } from "../utils/errors.js";
import { ACTIVE_CID, registerCustomer } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_27 Review Service - Admin Review Moderation (UC31)", () => {
    test("admin can list all reviews, view detail, and delete one", async () => {
        const { user } = await registerCustomer("tc27");

        try {
            const created = await reviewService.publishReview({
                userId: user.user_id,
                cid: ACTIVE_CID,
                title: "TC27 Moderate Me",
                body: "This review should be removable by admin moderation.",
                rating: 2,
            });

            const all = await reviewService.viewAllReviews({ limit: 100 });
            expect(
                all.items.some((r) => r.review_id === created.review_id),
            ).toBe(true);

            const byVehicle = await reviewService.viewAllCatalogReviews(
                ACTIVE_CID,
                {
                    limit: 50,
                },
            );
            expect(
                byVehicle.items.some((r) => r.review_id === created.review_id),
            ).toBe(true);

            const detail = await reviewService.viewReviewDetail(
                created.review_id,
            );
            expect(detail.review_id).toBe(created.review_id);

            await reviewService.deleteReview(created.review_id);

            await expect(
                reviewService.viewReviewDetail(created.review_id),
            ).rejects.toBeInstanceOf(NotFoundError);

            const publicList = await reviewService.viewCatalogReviews(
                ACTIVE_CID,
                {
                    limit: 50,
                },
            );
            expect(
                publicList.items.some((r) => r.review_id === created.review_id),
            ).toBe(false);
        } finally {
            await cleanupUser(user.user_id);
        }
    });
});
