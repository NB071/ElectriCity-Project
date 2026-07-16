/**
 * TC_29 - Payment Service - Admin Payment Oversight
 * UC33
 *
 * Expected: admin can list attempts, view detail, correct payment status.
 * Notes: no raw card numbers stored on attempts.
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

describe("TC_29 Payment Service - Admin Payment Oversight (UC33)", () => {
    test("lists attempts, views detail, and corrects order payment status", async () => {
        const { me } = await registerAndLogin("tc29");

        try {
            const orderId = await createUnpaidOrder(me.user_id);

            const processed = await paymentService.processPayment({
                user_id: me.user_id,
                order_id: orderId,
                amount: 113.0,
                payment_method: PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD_DETAILS,
            });

            const all = await paymentService.viewAllPaymentAttempts({
                page: 1,
                limit: 50,
            });
            expect(
                all.items.some((a) => a.attempt_id === processed.attempt_id),
            ).toBe(true);

            const byOrder =
                await paymentService.getPaymentAttemptsByOrderId(orderId);
            expect(byOrder.length).toBeGreaterThanOrEqual(1);

            const detail = await paymentService.getPaymentAttemptById(
                processed.attempt_id,
            );
            expect(detail.attempt_id).toBe(processed.attempt_id);
            expect(JSON.stringify(detail)).not.toMatch(/4111111111111111/);
            expect(JSON.stringify(detail)).not.toMatch(/"cvv"\s*:\s*"123"/);

            await paymentService.updateOrderPaymentStatus(
                orderId,
                ORDER_VALIDATIONS.PAYMENT_STATUS.PAID,
            );
        } finally {
            await cleanupUser(me.user_id);
        }
    });
});
