/**
 * TC_10 - Cart Service - View and Modify Cart
 * UC11
 *
 * Expected: quantity updates immediately; empty cart returns empty items.
 */
import cartService from "../services/cart/cart.service.js";
import { ACTIVE_CID, ensureCatalogStock } from "./helpers/tddFixtures.js";
import { deleteGuestCart } from "./helpers/cleanup.js";

describe("TC_10 Cart Service - View and Modify Cart (UC11)", () => {
    beforeEach(async () => {
        await ensureCatalogStock(ACTIVE_CID, 25);
    });

    test("view, update quantity, and remove reflect instantly", async () => {
        const added = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 1,
        });
        const sessionToken = added.session_token;

        try {
            const viewed = await cartService.viewCart(
                { userId: null, sessionToken },
                { page: 1, limit: 10 },
            );
            expect(viewed.items.length).toBeGreaterThanOrEqual(1);

            const updated = await cartService.updateCartItemQuantity({
                userId: null,
                sessionToken,
                cartItemId: added.cart_item_id,
                quantity: 2,
            });
            expect(Number(updated.quantity)).toBe(2);

            await cartService.removeFromCart({
                userId: null,
                sessionToken,
                cartItemId: added.cart_item_id,
            });

            const after = await cartService.viewCart(
                { userId: null, sessionToken },
                { page: 1, limit: 10 },
            );
            expect(after.items.length).toBe(0);
        } finally {
            await deleteGuestCart(sessionToken);
        }
    });
});
