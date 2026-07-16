import { ValidationError } from "../../../utils/errors.js";
import {
    validateCartOwner,
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateCartItemId,
    validateCatalogItemId,
    validateUserId,
    validateSortParams,
    validateMergeGuestCart,
} from "../../../services/cart/cartValidator.js";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("cartValidator", () => {
    test("validateCartOwner accepts user, guest, or neither", () => {
        expect(validateCartOwner({ userId: 1 })).toEqual({
            userId: 1,
            sessionToken: null,
        });
        expect(validateCartOwner({ sessionToken: UUID })).toEqual({
            userId: null,
            sessionToken: UUID,
        });
        expect(validateCartOwner({})).toEqual({
            userId: null,
            sessionToken: null,
        });
    });

    test("validateCartOwner rejects bad session token", () => {
        expect(() => validateCartOwner({ sessionToken: "not-uuid" })).toThrow(
            ValidationError,
        );
    });

    test("validateAddToCart happy path and defaults", () => {
        const data = validateAddToCart({ cid: 1, quantity: 2 });
        expect(data.cid).toBe(1);
        expect(data.quantity).toBe(2);
        expect(data.userId).toBeNull();
    });

    test("validateAddToCart rejects invalid cid / quantity", () => {
        expect(() => validateAddToCart({ cid: -1 })).toThrow(ValidationError);
        expect(() => validateAddToCart({ cid: 1, quantity: 0 })).toThrow(
            ValidationError,
        );
        expect(() => validateAddToCart({ cid: 1, quantity: 100 })).toThrow(
            ValidationError,
        );
    });

    test("validateUpdateCartItem requires owner", () => {
        expect(() =>
            validateUpdateCartItem({ cartItemId: 1, quantity: 2 }),
        ).toThrow(ValidationError);

        const ok = validateUpdateCartItem({
            userId: 5,
            cartItemId: 1,
            quantity: 2,
        });
        expect(ok.userId).toBe(5);
        expect(ok.quantity).toBe(2);
    });

    test("validateCartItemRef requires owner", () => {
        expect(() => validateCartItemRef({ cartItemId: 1 })).toThrow(
            ValidationError,
        );
        expect(
            validateCartItemRef({ sessionToken: UUID, cartItemId: 9 }).cartItemId,
        ).toBe(9);
    });

    test("id helpers and sort / merge", () => {
        expect(validateCartItemId("3")).toBe(3);
        expect(validateCatalogItemId(2)).toBe(2);
        expect(validateUserId(1)).toBe(1);
        expect(() => validateUserId(0)).toThrow(ValidationError);

        expect(validateSortParams({}).sort).toBe("added_at_desc");
        expect(() => validateSortParams({ sort: "nope" })).toThrow(
            ValidationError,
        );

        const merged = validateMergeGuestCart({
            userId: 1,
            sessionToken: UUID,
        });
        expect(merged.userId).toBe(1);
        expect(() =>
            validateMergeGuestCart({ userId: 1, sessionToken: "x" }),
        ).toThrow(ValidationError);
    });
});
