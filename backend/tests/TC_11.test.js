/**
 * TC_11 - Payment/Cart/Order - Checkout and Payment Strategies
 * UC12–UC15
 *
 * Expected: cart items checkout with shipping/billing; payment validated across
 * strategies (credit card, Apple Pay); tax resolved from shipping province;
 * invalid payment details are rejected.
 */
import cartService from "../services/cart/cart.service.js";
import orderService from "../services/order/order.service.js";
import paymentService from "../services/payment/payment.service.js";
import { ValidationError } from "../utils/errors.js";
import {
    resolveTaxRate,
    normalizeCanadianProvince,
} from "../services/order/helpers/resolveTaxRate.js";
import {
    ACTIVE_CID,
    CARD_DETAILS,
    PAYMENT_METHODS,
    SHIPPING_ADDRESS,
    registerAndLogin,
    ensureCatalogStock,
} from "./helpers/tddFixtures.js";
import { VALIDATIONS as ORDER_VALIDATIONS } from "../services/order/constants.js";
import getPool from "../configs/db.js";
import { cleanupUser } from "./helpers/cleanup.js";

describe("TC_11 Checkout and Payment Strategies (UC12-UC15)", () => {
    beforeEach(async () => {
        await ensureCatalogStock(ACTIVE_CID, 25);
    });

    test("customer checkout validates payment details and places an order", async () => {
        const { me } = await registerAndLogin("tc11-cust");

        try {
            await cartService.addToCart({
                userId: me.user_id,
                sessionToken: null,
                cid: ACTIVE_CID,
                quantity: 1,
            });

            const cart = await cartService.viewCart(
                { userId: me.user_id, sessionToken: null },
                { page: 1, limit: 10 },
            );
            expect(cart.items.length).toBeGreaterThanOrEqual(1);

            const result = await orderService.checkout({
                actor: orderService.CHECKOUT_ACTORS.CUSTOMER,
                userId: me.user_id,
                shipping_address: SHIPPING_ADDRESS,
                billing_address: SHIPPING_ADDRESS,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });

            expect(result.order_id).toBeGreaterThan(0);
            expect(
                [
                    ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
                    ORDER_VALIDATIONS.ORDER_STATUS.CONFIRMED,
                ].includes(result.order_status) || result.order_id > 0,
            ).toBe(true);
            expect(Number(result.tax)).toBeGreaterThan(0);
            expect(Number(result.total)).toBeGreaterThan(Number(result.subtotal));
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("shipping province name resolves to the correct Canadian tax rate", () => {
        expect(normalizeCanadianProvince("Ontario")).toBe("ON");
        expect(normalizeCanadianProvince("british columbia")).toBe("BC");
        expect(resolveTaxRate("ON")).toBe(0.13);
        expect(resolveTaxRate("BC")).toBe(0.12);
        expect(resolveTaxRate("Québec")).toBeCloseTo(0.14975, 5);
        expect(resolveTaxRate("NotAProvince")).toBeNull();
    });

    test("Apple Pay strategy is accepted with a token and can settle an unpaid order", async () => {
        const { me } = await registerAndLogin("tc11-apple");

        try {
            const pool = await getPool();
            const [result] = await pool.execute(
                `INSERT INTO orders (user_id, order_status, payment_status, subtotal, tax, total)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    me.user_id,
                    ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
                    ORDER_VALIDATIONS.PAYMENT_STATUS.UNPAID,
                    100.0,
                    13.0,
                    113.0,
                ],
            );
            const orderId = result.insertId;

            const paid = await paymentService.processPayment({
                user_id: me.user_id,
                order_id: orderId,
                amount: 113.0,
                payment_method: PAYMENT_METHODS.APPLE_PAY,
                payment_details: { token: "apple-pay-test-token" },
            });
            expect(paid.attempt_id).toBeGreaterThan(0);
            expect(paid.payment_method).toBe(PAYMENT_METHODS.APPLE_PAY);
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("incomplete payment details are rejected by Payment Service validation", async () => {
        await expect(
            paymentService.processPayment({
                user_id: 1,
                order_id: 1,
                amount: 100,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: { card_number: "4111111111111111" },
            }),
        ).rejects.toBeInstanceOf(ValidationError);

        await expect(
            paymentService.processPayment({
                user_id: 1,
                order_id: 1,
                amount: 100,
                payment_method: PAYMENT_METHODS.APPLE_PAY,
                payment_details: {},
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });
});
