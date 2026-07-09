// Review service tests
// script: npm run test:review

import reviewService from "../../services/review/review.service.js";
import catalogService from "../../services/catalog/catalog.service.js";
import { validatePublishReview } from "../../services/review/reviewValidator.js";
import accountDAO from "../../services/iam/_identity/accountDAO.js";
import iamService from "../../services/iam/iam.service.js";
import getPool from "../../configs/db.js";
import {
    ValidationError,
    NotFoundError,
    ConflictError,
} from "../../utils/errors.js";
import { VALIDATIONS } from "../../services/review/constants.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function testPublishReviewValidator() {
    const valid = validatePublishReview({
        userId: 1,
        cid: 1,
        title: "Great car",
        body: "Loved it.",
        rating: 5,
    });
    assert(valid.rating === 5, "rating 5 should be accepted");

    const emptyTitle = validatePublishReview({
        userId: 1,
        cid: 1,
        title: "",
        body: "No title review.",
        rating: 4,
    });
    assert(emptyTitle.title === null, "empty title should normalize to null");

    try {
        validatePublishReview({
            userId: 1,
            cid: 1,
            title: "Too long",
            body: "x".repeat(VALIDATIONS.REVIEW_LIMITS.BODY_MAX + 1),
            rating: 3,
        });
        throw new Error("Expected body max length validation to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "oversized body should throw ValidationError",
        );
        assert(
            error.message.includes(
                String(VALIDATIONS.REVIEW_LIMITS.BODY_MAX),
            ),
            "body max length error should mention the limit",
        );
    }

    console.log("SUCCESS: publish review validator checks passed");
}

async function testPublishReviewNotFound() {
    const email = `review-not-found-${Date.now()}@example.com`;
    const password = "Password1!";

    const user = await iamService.access_management.register({
        firstName: "Review",
        lastName: "Tester",
        email,
        password,
    });

    try {
        await reviewService.publishReview({
            userId: user.user_id,
            cid: 9_999_999,
            title: "Missing item",
            body: "This catalog item does not exist.",
            rating: 4,
        });
        throw new Error("Expected publish on missing catalog item to fail");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "missing catalog item should throw NotFoundError",
        );
    }

    console.log("SUCCESS: publish on missing catalog item returns 404");
}

async function testViewCatalogReviewsNotFound() {
    try {
        await reviewService.viewCatalogReviews(9_999_999);
        throw new Error("Expected catalog review list on missing item to fail");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "missing catalog item list should throw NotFoundError",
        );
    }

    console.log("SUCCESS: catalog review list on missing item returns 404");
}

async function testPublishOnInactiveCatalogItem() {
    const email = `review-inactive-${Date.now()}@example.com`;
    const password = "Password1!";
    const inactiveCid = 5;

    const user = await iamService.access_management.register({
        firstName: "Review",
        lastName: "Inactive",
        email,
        password,
    });

    const pool = await getPool();
    await pool.execute(
        `UPDATE catalog_items SET is_active = FALSE WHERE cid = ?`,
        [inactiveCid],
    );

    try {
        try {
            await reviewService.publishReview({
                userId: user.user_id,
                cid: inactiveCid,
                title: "Inactive item",
                body: "Should not be allowed on inactive catalog items.",
                rating: 4,
            });
            throw new Error(
                "Expected publish on inactive catalog item to fail",
            );
        } catch (error) {
            assert(
                error instanceof NotFoundError,
                "inactive catalog item publish should throw NotFoundError",
            );
        }

        try {
            await reviewService.viewCatalogReviews(inactiveCid);
            throw new Error(
                "Expected catalog review list on inactive item to fail",
            );
        } catch (error) {
            assert(
                error instanceof NotFoundError,
                "inactive catalog item list should throw NotFoundError",
            );
        }
    } finally {
        await pool.execute(
            `UPDATE catalog_items SET is_active = TRUE WHERE cid = ?`,
            [inactiveCid],
        );
    }

    console.log("SUCCESS: inactive catalog items reject publish and public list");
}

async function testPublishReviewDuplicate() {
    const email = `review-duplicate-${Date.now()}@example.com`;
    const password = "Password1!";

    const user = await iamService.access_management.register({
        firstName: "Review",
        lastName: "Tester",
        email,
        password,
    });

    await reviewService.publishReview({
        userId: user.user_id,
        cid: 1,
        title: "First review",
        body: "Initial review body.",
        rating: 5,
    });

    try {
        await reviewService.publishReview({
            userId: user.user_id,
            cid: 1,
            title: "Duplicate",
            body: "Should not be allowed.",
            rating: 3,
        });
        throw new Error("Expected duplicate review publish to fail");
    } catch (error) {
        assert(
            error instanceof ConflictError,
            "duplicate review should throw ConflictError",
        );
    }

    console.log("SUCCESS: duplicate review publish returns 409");
}

async function testPublishAndListCatalogReviews() {
    const email = `review-list-${Date.now()}@example.com`;
    const password = "Password1!";

    const user = await iamService.access_management.register({
        firstName: "Review",
        lastName: "Lister",
        email,
        password,
    });

    const created = await reviewService.publishReview({
        userId: user.user_id,
        cid: 2,
        title: null,
        body: "Visible on the catalog page.",
        rating: 4,
    });

    assert(created.created_at, "publish response should include created_at");

    const { items } = await reviewService.viewCatalogReviews(2, { limit: 50 });
    const match = items.find((item) => item.review_id === created.review_id);

    assert(match, "published review should appear in catalog review list");
    assert(match.title === null, "null title should be returned as null");
    assert(
        match.author.user_id === user.user_id,
        "catalog review should include the author",
    );

    console.log("SUCCESS: publish and list catalog reviews passed");
}

async function testCatalogDetailIncludesReviewSummary() {
    const details = await catalogService.getCatalogItemDetails(1);

    assert(
        typeof details.review_count === "number",
        "catalog detail should include review_count",
    );
    assert(
        details.review_count >= 1,
        "seeded catalog item should have at least one review",
    );
    assert(
        typeof details.avg_rating === "number",
        "catalog detail should include avg_rating when reviews exist",
    );

    const summary = await reviewService.getCatalogReviewSummary(1);
    assert(
        details.review_count === summary.review_count,
        "catalog detail review_count should match review summary query",
    );
    assert(
        details.avg_rating === summary.avg_rating,
        "catalog detail avg_rating should match review summary query",
    );

    console.log("SUCCESS: catalog detail includes review summary");
}

async function testDeletedUserReviewsAreHiddenFromPublicButVisibleToAdmin() {
    const email = `review-deleted-user-${Date.now()}@example.com`;
    const password = "Password1!";

    const user = await iamService.access_management.register({
        firstName: "Deleted",
        lastName: "Reviewer",
        email,
        password,
    });

    const created = await reviewService.publishReview({
        userId: user.user_id,
        cid: 4,
        title: "Before delete",
        body: "This review should disappear from public views after account deletion.",
        rating: 3,
    });

    const beforeDelete = await reviewService.viewCatalogReviews(4, {
        limit: 50,
    });
    assert(
        beforeDelete.items.some((item) => item.review_id === created.review_id),
        "review should be visible before account deletion",
    );

    await accountDAO.softDeleteById(user.user_id);

    const afterDelete = await reviewService.viewCatalogReviews(4, {
        limit: 50,
    });
    assert(
        !afterDelete.items.some((item) => item.review_id === created.review_id),
        "review from deleted user should not appear in public catalog list",
    );

    const adminList = await reviewService.viewAllReviews({ limit: 100 });
    const adminMatch = adminList.items.find(
        (item) => item.review_id === created.review_id,
    );
    assert(
        adminMatch,
        "admin list should still include review from deleted user",
    );
    assert(
        adminMatch.user.is_deleted === true,
        "admin list should flag deleted author",
    );

    const adminDetail = await reviewService.viewReviewDetail(
        created.review_id,
    );
    assert(
        adminDetail.user.is_deleted === true,
        "admin detail should flag deleted author",
    );

    await reviewService.deleteReview(created.review_id);

    try {
        await reviewService.viewReviewDetail(created.review_id);
        throw new Error("Expected deleted review detail to fail");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "deleted review detail should throw NotFoundError",
        );
    }

    console.log(
        "SUCCESS: deleted-user reviews hidden publicly but manageable by admin",
    );
}

(async () => {
    try {
        testPublishReviewValidator();
        await testPublishReviewNotFound();
        await testViewCatalogReviewsNotFound();
        await testPublishOnInactiveCatalogItem();
        await testPublishReviewDuplicate();
        await testPublishAndListCatalogReviews();
        await testCatalogDetailIncludesReviewSummary();
        await testDeletedUserReviewsAreHiddenFromPublicButVisibleToAdmin();
        process.exit(0);
    } catch (error) {
        console.error("FAIL:", error.message);
        if (error.code === "ECONNREFUSED") {
            console.error(
                "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
            );
        }
        process.exit(1);
    }
})();
