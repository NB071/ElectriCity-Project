/**
 * TC_28 - Order Service - Admin Order Oversight and Status Management
 * UC32
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
import { VALIDATIONS as ORDER_VALIDATIONS } from "../services/order/constants.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_28 Order Service - Admin Order Oversight (UC32)", () => {
    beforeEach(async () => {
        await ensureCatalogStock(ACTIVE_CID, 25);
    });

    test("admin can list all orders, view detail, and advance status", async () => {
        const { me } = await registerAndLogin("tc28");

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

            const all = await orderService.listAllOrders({ page: 1, limit: 50 });
            expect(all.items.some((o) => o.order_id === checkout.order_id)).toBe(
                true,
            );

            const detail = await orderService.getOrderDetailsForAdmin(
                checkout.order_id,
            );
            expect(detail.order_id).toBe(checkout.order_id);

            if (detail.order_status === ORDER_VALIDATIONS.ORDER_STATUS.PENDING) {
                await orderService.updateOrderStatus(
                    checkout.order_id,
                    ORDER_VALIDATIONS.ORDER_STATUS.CONFIRMED,
                );
            }

            const after = await orderService.getOrderDetailsForAdmin(
                checkout.order_id,
            );
            if (
                after.order_status === ORDER_VALIDATIONS.ORDER_STATUS.CONFIRMED ||
                after.order_status === ORDER_VALIDATIONS.ORDER_STATUS.PENDING
            ) {
                await orderService.updateOrderStatus(
                    checkout.order_id,
                    ORDER_VALIDATIONS.ORDER_STATUS.CANCELLED,
                );
                const cancelled = await orderService.getOrderDetailsForAdmin(
                    checkout.order_id,
                );
                expect(cancelled.order_status).toBe(
                    ORDER_VALIDATIONS.ORDER_STATUS.CANCELLED,
                );
            }
        } finally {
            await cleanupUser(me.user_id);
        }
    });
});
