/**
 * TC_23 - Order Service - Customer Order History and Order Details
 * UC27
 */
import cartService from "../services/cart/cart.service.js";
import orderService from "../services/order/order.service.js";
import {
    ACTIVE_CID,
    CARD_DETAILS,
    PAYMENT_METHODS,
    SHIPPING_ADDRESS,
    registerAndLogin,
    ensureCatalogStock,
} from "./helpers/tddFixtures.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_23 Order Service - Customer Order History (UC27)", () => {
    beforeEach(async () => {
        await ensureCatalogStock(ACTIVE_CID, 25);
    });

    test("lists customer orders and returns owned order detail", async () => {
        const { me } = await registerAndLogin("tc23");

        try {
            await cartService.addToCart({
                userId: me.user_id,
                sessionToken: null,
                cid: ACTIVE_CID,
                quantity: 1,
            });

            const checkout = await orderService.checkout({
                actor: orderService.CHECKOUT_ACTORS.CUSTOMER,
                userId: me.user_id,
                shipping_address: SHIPPING_ADDRESS,
                billing_address: SHIPPING_ADDRESS,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });

            const history = await orderService.listOrdersByUserId(me.user_id, {
                page: 1,
                limit: 20,
            });
            expect(history.items.length).toBeGreaterThanOrEqual(1);
            expect(
                history.items.some((o) => o.order_id === checkout.order_id),
            ).toBe(true);

            const detail = await orderService.getOrderDetailsForUser(
                me.user_id,
                checkout.order_id,
            );
            expect(detail.order_id).toBe(checkout.order_id);
            expect(
                Array.isArray(detail.items) || Array.isArray(detail.line_items),
            ).toBe(true);
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("rejects viewing another customer's order by id", async () => {
        const owner = await registerAndLogin("tc23-owner");
        const other = await registerAndLogin("tc23-other");

        try {
            await cartService.addToCart({
                userId: owner.me.user_id,
                sessionToken: null,
                cid: ACTIVE_CID,
                quantity: 1,
            });
            const checkout = await orderService.checkout({
                actor: orderService.CHECKOUT_ACTORS.CUSTOMER,
                userId: owner.me.user_id,
                shipping_address: SHIPPING_ADDRESS,
                billing_address: SHIPPING_ADDRESS,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });

            await expect(
                orderService.getOrderDetailsForUser(
                    other.me.user_id,
                    checkout.order_id,
                ),
            ).rejects.toThrow();
        } finally {
            await cleanupUser(owner.me.user_id);
            await cleanupUser(other.me.user_id);
        }
    });
});
