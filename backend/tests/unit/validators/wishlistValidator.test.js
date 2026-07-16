import { ValidationError } from "../../../utils/errors.js";
import {
    validateAddToWishlist,
    validateWishlistEntry,
    validateCatalogItemId,
    validateUserId,
    validateSortParams,
} from "../../../services/wishlist/wishlistValidator.js";

describe("wishlistValidator", () => {
    test("add / entry happy path", () => {
        expect(validateAddToWishlist({ userId: 1, cid: 2 })).toEqual({
            userId: 1,
            cid: 2,
        });
        expect(validateWishlistEntry({ userId: "3", cid: "4" })).toEqual({
            userId: 3,
            cid: 4,
        });
    });

    test("rejects missing or invalid ids", () => {
        expect(() => validateAddToWishlist({ userId: 1 })).toThrow(
            ValidationError,
        );
        expect(() => validateAddToWishlist({ cid: 1 })).toThrow(
            ValidationError,
        );
        expect(() => validateWishlistEntry({ userId: -1, cid: 1 })).toThrow(
            ValidationError,
        );
    });

    test("id helpers and sort", () => {
        expect(validateCatalogItemId(5)).toBe(5);
        expect(validateUserId("9")).toBe(9);
        expect(() => validateUserId(0)).toThrow(ValidationError);
        expect(validateSortParams({}).sort).toBeTruthy();
        expect(() => validateSortParams({ sort: "bad" })).toThrow(
            ValidationError,
        );
    });
});
