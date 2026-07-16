import { ValidationError } from "../../../utils/errors.js";
import {
    validatePublishReview,
    validateReviewId,
    validateCatalogItemId,
    validateUserId,
} from "../../../services/review/reviewValidator.js";

describe("reviewValidator", () => {
    test("publishReview accepts valid payload and null title", () => {
        const data = validatePublishReview({
            userId: 1,
            cid: 2,
            title: "  Great  ",
            body: "Nice car",
            rating: 5,
        });
        expect(data.title).toBe("Great");
        expect(data.rating).toBe(5);

        const blankTitle = validatePublishReview({
            userId: 1,
            cid: 2,
            title: "   ",
            body: "body",
            rating: 1,
        });
        expect(blankTitle.title).toBeNull();
    });

    test("publishReview rejects bad rating / empty body", () => {
        expect(() =>
            validatePublishReview({
                userId: 1,
                cid: 2,
                body: "",
                rating: 5,
            }),
        ).toThrow(ValidationError);
        expect(() =>
            validatePublishReview({
                userId: 1,
                cid: 2,
                body: "ok",
                rating: 0,
            }),
        ).toThrow(ValidationError);
        expect(() =>
            validatePublishReview({
                userId: 1,
                cid: 2,
                body: "ok",
                rating: 6,
            }),
        ).toThrow(ValidationError);
    });

    test("id helpers", () => {
        expect(validateReviewId("10")).toBe(10);
        expect(validateCatalogItemId(1)).toBe(1);
        expect(validateUserId(2)).toBe(2);
        expect(() => validateReviewId(-1)).toThrow(ValidationError);
    });
});
