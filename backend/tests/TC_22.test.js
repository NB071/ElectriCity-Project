/**
 * TC_22 - Cart Service - Guest vs Customer Cart Isolation
 * UC26
 *
 * Expected: ownership strategies isolate carts; guest cart merge moves items
 * into the customer cart and deletes the guest session cart.
 */
import cartService from "../services/cart/cart.service.js";
import { resolveCartKind } from "../services/cart/helpers/resolveCartKind.js";
import { CART_KINDS } from "../services/cart/constants.js";
import {
    ACTIVE_CID,
    SECOND_CID,
    registerAndLogin,
    ensureCatalogStock,
} from "./helpers/tddFixtures.js";
import { cleanupUser, deleteGuestCart } from "./helpers/cleanup.js";

describe("TC_22 Cart Service - Guest vs Customer Cart Isolation (UC26)", () => {
    beforeEach(async () => {
        await ensureCatalogStock([ACTIVE_CID, SECOND_CID], 25);
    });

    test("resolveCartKind separates guest and customer ownership strategies", () => {
        expect(resolveCartKind({ userId: 1, sessionToken: null })).toBe(
            CART_KINDS.CUSTOMER,
        );
        expect(
            resolveCartKind({
                userId: null,
                sessionToken: "550e8400-e29b-41d4-a716-446655440000",
            }),
        ).toBe(CART_KINDS.GUEST);
    });

    test("guest and customer carts do not leak items across owners", async () => {
        const guestAdd = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 1,
        });
        const { me } = await registerAndLogin("tc22");

        try {
            const customerAdd = await cartService.addToCart({
                userId: me.user_id,
                sessionToken: null,
                cid: SECOND_CID,
                quantity: 1,
            });

            const guestView = await cartService.viewCart(
                { userId: null, sessionToken: guestAdd.session_token },
                { page: 1, limit: 20 },
            );
            const customerView = await cartService.viewCart(
                { userId: me.user_id, sessionToken: null },
                { page: 1, limit: 20 },
            );

            expect(
                guestView.items.some(
                    (i) => i.cart_item_id === guestAdd.cart_item_id,
                ),
            ).toBe(true);
            expect(
                customerView.items.some(
                    (i) => i.cart_item_id === customerAdd.cart_item_id,
                ),
            ).toBe(true);
            expect(
                guestView.items.some(
                    (i) => i.cart_item_id === customerAdd.cart_item_id,
                ),
            ).toBe(false);
            expect(
                customerView.items.some(
                    (i) => i.cart_item_id === guestAdd.cart_item_id,
                ),
            ).toBe(false);
        } finally {
            await deleteGuestCart(guestAdd.session_token);
            await cleanupUser(me.user_id);
        }
    });

    test("guest cart is unretrievable without the original session token", async () => {
        const guestAdd = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 1,
        });

        try {
            const withToken = await cartService.viewCart(
                { userId: null, sessionToken: guestAdd.session_token },
                { page: 1, limit: 10 },
            );
            expect(withToken.items.length).toBeGreaterThanOrEqual(1);

            const withoutToken = await cartService.viewCart(
                { userId: null, sessionToken: null },
                { page: 1, limit: 10 },
            );
            expect(withoutToken.items.length).toBe(0);
            expect(withoutToken.session_token).toBeNull();
        } finally {
            await deleteGuestCart(guestAdd.session_token);
        }
    });

    test("mergeGuestCartIntoUser moves guest lines into the customer cart", async () => {
        const guestAdd = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 1,
        });
        const sessionToken = guestAdd.session_token;
        const { me } = await registerAndLogin("tc22-merge");

        try {
            const merge = await cartService.mergeGuestCartIntoUser({
                userId: me.user_id,
                sessionToken,
            });
            expect(merge.merged).toBe(true);
            expect(merge.moved_items).toBeGreaterThanOrEqual(1);

            const customerView = await cartService.viewCart(
                { userId: me.user_id, sessionToken: null },
                { page: 1, limit: 20 },
            );
            expect(customerView.items.some((i) => i.cid === ACTIVE_CID)).toBe(
                true,
            );

            const guestAfter = await cartService.viewCart(
                { userId: null, sessionToken },
                { page: 1, limit: 10 },
            );
            expect(guestAfter.items.length).toBe(0);
        } finally {
            await deleteGuestCart(sessionToken);
            await cleanupUser(me.user_id);
        }
    });
});
