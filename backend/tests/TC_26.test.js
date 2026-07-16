/**
 * TC_26 - Wishlist Service - Add, View, and Remove Vehicles
 * UC30
 */
import wishlistService from "../services/wishlist/wishlist.service.js";
import { NotFoundError } from "../utils/errors.js";
import { ACTIVE_CID, registerAndLogin } from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_26 Wishlist Service - Add, View, and Remove (UC30)", () => {
    test("new user wishlist starts empty; add then remove updates immediately", async () => {
        const { me } = await registerAndLogin("tc26");

        try {
            const initial = await wishlistService.viewWishlist(me.user_id, {
                page: 1,
                limit: 20,
            });
            expect(initial.items.length).toBe(0);

            await wishlistService.addToWishlist({
                userId: me.user_id,
                cid: ACTIVE_CID,
            });

            const entry = await wishlistService.isInWishlist(
                me.user_id,
                ACTIVE_CID,
            );
            expect(entry.cid).toBe(ACTIVE_CID);

            const afterAdd = await wishlistService.viewWishlist(me.user_id, {
                page: 1,
                limit: 20,
            });
            expect(afterAdd.items.some((i) => i.cid === ACTIVE_CID)).toBe(true);

            await wishlistService.removeFromWishlist({
                userId: me.user_id,
                cid: ACTIVE_CID,
            });

            await expect(
                wishlistService.isInWishlist(me.user_id, ACTIVE_CID),
            ).rejects.toBeInstanceOf(NotFoundError);

            const afterRemove = await wishlistService.viewWishlist(me.user_id, {
                page: 1,
                limit: 20,
            });
            expect(afterRemove.items.some((i) => i.cid === ACTIVE_CID)).toBe(
                false,
            );
        } finally {
            await cleanupUser(me.user_id);
        }
    });
});
