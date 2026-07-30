/**
 * TC_09 - Cart Service - Add to Cart
 * UC10
 *
 * Initial: guests and customers may add in-stock vehicles (base or customized).
 * Expected: cart updated after add; customized lines retain config_id.
 */
import cartService from "../services/cart/cart.service.js";
import catalogService from "../services/catalog/catalog.service.js";
import { getForItem } from "../services/catalog/_options/optionsQuery.js";
import {
    ACTIVE_CID,
    registerAndLogin,
    ensureCatalogStock,
} from "./helpers/tddFixtures.js";
import {
    cleanupUser,
    deleteGuestCart,
    deleteConfiguration,
} from "./helpers/cleanup.js";

describe("TC_09 Cart Service - Add to Cart (UC10)", () => {
    beforeEach(async () => {
        await ensureCatalogStock([ACTIVE_CID], 25);
    });

    test("guest can add an in-stock vehicle and receives a session token", async () => {
        const added = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 1,
        });

        try {
            expect(added.is_guest).toBe(true);
            expect(typeof added.session_token).toBe("string");
            expect(added.cid).toBe(ACTIVE_CID);
            expect(Number(added.quantity)).toBe(1);

            const viewed = await cartService.viewCart(
                { userId: null, sessionToken: added.session_token },
                { page: 1, limit: 10 },
            );
            expect(
                viewed.items.some((i) => i.cart_item_id === added.cart_item_id),
            ).toBe(true);
        } finally {
            await deleteGuestCart(added.session_token);
        }
    });

    test("authenticated customer can add a vehicle tied to their user id", async () => {
        const { me } = await registerAndLogin("tc09");

        try {
            const added = await cartService.addToCart({
                userId: me.user_id,
                sessionToken: null,
                cid: ACTIVE_CID,
                quantity: 1,
            });

            expect(added.is_guest).toBe(false);
            expect(added.cid).toBe(ACTIVE_CID);

            const viewed = await cartService.viewCart(
                { userId: me.user_id, sessionToken: null },
                { page: 1, limit: 10 },
            );
            expect(
                viewed.items.some((i) => i.cart_item_id === added.cart_item_id),
            ).toBe(true);
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("guest can add a customized vehicle using a configuration", async () => {
        const groups = await getForItem(ACTIVE_CID);
        const optionIds = groups
            .filter((g) => g.select_type === "SINGLE")
            .map((g) => g.options[0].option_id);

        const config = await catalogService.createConfiguration({
            cid: ACTIVE_CID,
            option_ids: optionIds,
        });
        const configId =
            config.config_id ?? config.id ?? config.configuration_id;

        const added = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            configId,
            quantity: 1,
        });

        try {
            expect(added.config_id).toBe(configId);
            expect(added.is_guest).toBe(true);

            const viewed = await cartService.viewCart(
                { userId: null, sessionToken: added.session_token },
                { page: 1, limit: 10 },
            );
            expect(
                viewed.items.some(
                    (i) =>
                        i.cart_item_id === added.cart_item_id &&
                        i.config_id === configId,
                ),
            ).toBe(true);
        } finally {
            await deleteGuestCart(added.session_token);
            await deleteConfiguration(configId);
        }
    });

    test("guest cart summary returns lite preview without full line DTOs", async () => {
        const added = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 2,
        });

        try {
            const summary = await cartService.viewCartSummary(
                { userId: null, sessionToken: added.session_token },
                { limit: 5 },
            );

            expect(summary.is_guest).toBe(true);
            expect(summary.item_count).toBe(1);
            expect(summary.quantity_total).toBe(2);
            expect(summary.subtotal).toBeGreaterThan(0);
            expect(summary.preview_limit).toBe(5);
            expect(summary.preview).toHaveLength(1);
            expect(summary.preview[0]).toMatchObject({
                cart_item_id: added.cart_item_id,
                cid: ACTIVE_CID,
                quantity: 2,
            });
            expect(summary.preview[0]).not.toHaveProperty("catalog_item");
            expect(summary.preview[0]).not.toHaveProperty("configuration");
        } finally {
            await deleteGuestCart(added.session_token);
        }
    });
});
