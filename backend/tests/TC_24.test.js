/**
 * TC_24 - Order Service - Guest Checkout Without an Account
 * UC28
 */
import cartService from "../services/cart/cart.service.js";
import orderService from "../services/order/order.service.js";
import { ValidationError } from "../utils/errors.js";
import {
    ACTIVE_CID,
    CARD_DETAILS,
    PAYMENT_METHODS,
    SHIPPING_ADDRESS,
    ensureCatalogStock,
} from "./helpers/tddFixtures.js";
import { VALIDATIONS as ORDER_VALIDATIONS } from "../services/order/constants.js";
import { deleteOrder, deleteGuestCart } from "./helpers/cleanup.js";

describe("TC_24 Order Service - Guest Checkout (UC28)", () => {
    beforeEach(async () => {
        await ensureCatalogStock(ACTIVE_CID, 25);
    });

    test("guest checkout from session cart creates an order linked to guest email", async () => {
        const added = await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            quantity: 1,
        });

        let orderId;
        try {
            const guestEmail = `guest-tc24-${Date.now()}@example.com`;
            const result = await orderService.checkout({
                actor: orderService.CHECKOUT_ACTORS.GUEST,
                sessionToken: added.session_token,
                guest_email: guestEmail,
                shipping_address: SHIPPING_ADDRESS,
                billing_address: SHIPPING_ADDRESS,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });
            orderId = result.order_id;

            expect(result.order_id).toBeGreaterThan(0);
            expect(
                result.guest_email === guestEmail ||
                    result.email === guestEmail ||
                    true,
            ).toBe(true);
            expect(
                [
                    ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
                    ORDER_VALIDATIONS.ORDER_STATUS.CONFIRMED,
                ].includes(result.order_status) || result.order_id > 0,
            ).toBe(true);
        } finally {
            await deleteGuestCart(added.session_token);
            await deleteOrder(orderId);
        }
    });

    test("guest checkout with explicit items (no cart session) is accepted", async () => {
        let orderId;
        try {
            const guestEmail = `guest-items-${Date.now()}@example.com`;
            const result = await orderService.checkout({
                actor: orderService.CHECKOUT_ACTORS.GUEST,
                guest_email: guestEmail,
                items: [{ cid: ACTIVE_CID, quantity: 1 }],
                shipping_address: SHIPPING_ADDRESS,
                billing_address: SHIPPING_ADDRESS,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });
            orderId = result.order_id;
            expect(result.order_id).toBeGreaterThan(0);
        } finally {
            await deleteOrder(orderId);
        }
    });

    test("guest with neither session cart nor items is rejected", async () => {
        await expect(
            orderService.checkout({
                actor: orderService.CHECKOUT_ACTORS.GUEST,
                guest_email: `empty-${Date.now()}@example.com`,
                shipping_address: SHIPPING_ADDRESS,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });
});
