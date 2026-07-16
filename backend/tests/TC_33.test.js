/**
 * TC_33 - Payment Service - Customer Payment Attempt History
 * UC37: View Personal Payment Attempt History
 *
 * Expected: signed-in customer sees only their own payment attempts
 * (method + status + amount; no raw card data).
 */
import paymentService from "../services/payment/payment.service.js";
import getPool from "../configs/db.js";
import {
    CARD_DETAILS,
    PAYMENT_METHODS,
    registerAndLogin,
} from "./helpers/tddFixtures.js";
import { VALIDATIONS as ORDER_VALIDATIONS } from "../services/order/constants.js";
import { cleanupUser } from "./helpers/cleanup.js";

async function createUnpaidOrder(userId, total = 113.0) {
    const pool = await getPool();
    const [result] = await pool.execute(
        `INSERT INTO orders (user_id, order_status, payment_status, subtotal, tax, total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userId,
            ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
            ORDER_VALIDATIONS.PAYMENT_STATUS.UNPAID,
            100.0,
            13.0,
            total,
        ],
    );
    return result.insertId;
}

describe("TC_33 Payment Service - Customer Payment Attempt History (UC37)", () => {
    test("new customer payment history starts empty", async () => {
        const { me } = await registerAndLogin("tc33-empty");

        try {
            const history = await paymentService.getPaymentAttemptsByUserId(
                me.user_id,
                { page: 1, limit: 20 },
            );

            expect(Array.isArray(history.items)).toBe(true);
            expect(history.items.length).toBe(0);
            expect(history.pagination.total).toBe(0);
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("customer sees their own payment attempts after paying", async () => {
        const { me } = await registerAndLogin("tc33-hist");

        try {
            const orderId = await createUnpaidOrder(me.user_id, 113.0);

            const paid = await paymentService.processPayment({
                user_id: me.user_id,
                order_id: orderId,
                amount: 113.0,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });

            const history = await paymentService.getPaymentAttemptsByUserId(
                me.user_id,
                { page: 1, limit: 20 },
            );

            const match = history.items.find(
                (a) => a.attempt_id === paid.attempt_id,
            );
            expect(match).toBeTruthy();
            expect(match.order_id).toBe(orderId);
            expect(match.payment_method).toBe(PAYMENT_METHODS.CREDIT_CARD);
            expect(Number(match.amount)).toBe(113);
            expect(match.status).toBeTruthy();
            expect(match.attempted_at).toBeTruthy();
            expect(JSON.stringify(match)).not.toMatch(/4111111111111111/);
            expect(JSON.stringify(match)).not.toMatch(/"cvv"/);
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("customer cannot see another customer's payment attempts", async () => {
        const owner = await registerAndLogin("tc33-owner");
        const other = await registerAndLogin("tc33-other");

        try {
            const orderId = await createUnpaidOrder(owner.me.user_id, 113.0);

            const paid = await paymentService.processPayment({
                user_id: owner.me.user_id,
                order_id: orderId,
                amount: 113.0,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });

            const otherHistory =
                await paymentService.getPaymentAttemptsByUserId(
                    other.me.user_id,
                    { page: 1, limit: 50 },
                );

            expect(
                otherHistory.items.some(
                    (a) => a.attempt_id === paid.attempt_id,
                ),
            ).toBe(false);
        } finally {
            await cleanupUser(owner.me.user_id);
            await cleanupUser(other.me.user_id);
        }
    });
});
