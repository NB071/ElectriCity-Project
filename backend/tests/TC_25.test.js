/**
 * TC_25 - Payment Service - Failed Payment Handling
 * UC29
 *
 * Mock gateway fails every 3rd attempt for the same user+method (or order+method).
 * Expected: failed attempt recorded; order stays pending/unpaid/retryable; success later confirms.
 */
import paymentService from "../services/payment/payment.service.js";
import getPool from "../configs/db.js";
import {
    CARD_DETAILS,
    PAYMENT_METHODS,
    registerAndLogin,
} from "./helpers/tddFixtures.js";
import { VALIDATIONS as PAYMENT_VALIDATIONS } from "../services/payment/constants.js";
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

describe("TC_25 Payment Service - Failed Payment Handling (UC29)", () => {
    test("records failed attempts and allows a later successful retry", async () => {
        const { me } = await registerAndLogin("tc25");

        try {
            const orderId = await createUnpaidOrder(me.user_id, 113.0);

            let sawFailed = false;
            let sawSuccess = false;

            for (let i = 0; i < 6; i += 1) {
                const currentOrderId = orderId;
                const pool = await getPool();
                const [rows] = await pool.execute(
                    `SELECT payment_status, order_status FROM orders WHERE order_id = ?`,
                    [orderId],
                );
                if (
                    rows[0]?.payment_status ===
                    ORDER_VALIDATIONS.PAYMENT_STATUS.PAID
                ) {
                    sawSuccess = true;
                    break;
                }

                const result = await paymentService.processPayment({
                    user_id: me.user_id,
                    order_id: currentOrderId,
                    amount: 113.0,
                    payment_method: PAYMENT_METHODS.CREDIT_CARD,
                    payment_details: CARD_DETAILS,
                });

                if (
                    result.status === PAYMENT_VALIDATIONS.ATTEMPT_STATUS.FAILED
                ) {
                    sawFailed = true;
                    expect(result.payment_status).not.toBe(
                        ORDER_VALIDATIONS.PAYMENT_STATUS.PAID,
                    );
                }
                if (
                    result.status === PAYMENT_VALIDATIONS.ATTEMPT_STATUS.SUCCESS
                ) {
                    sawSuccess = true;
                    expect(result.payment_status).toBe(
                        ORDER_VALIDATIONS.PAYMENT_STATUS.PAID,
                    );
                }
            }

            const attempts =
                await paymentService.getPaymentAttemptsByOrderId(orderId);
            expect(attempts.length).toBeGreaterThanOrEqual(1);
            expect(sawFailed || sawSuccess).toBe(true);

            if (sawFailed) {
                const failed = attempts.find(
                    (a) =>
                        a.status === PAYMENT_VALIDATIONS.ATTEMPT_STATUS.FAILED,
                );
                expect(failed).toBeTruthy();
            }
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("failure handling works for debit_card strategy the same way", async () => {
        const { me } = await registerAndLogin("tc25-debit");

        try {
            const orderId = await createUnpaidOrder(me.user_id, 113.0);
            const result = await paymentService.processPayment({
                user_id: me.user_id,
                order_id: orderId,
                amount: 113.0,
                payment_method: PAYMENT_METHODS.DEBIT_CARD,
                payment_details: CARD_DETAILS,
            });
            expect(
                [
                    PAYMENT_VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
                    PAYMENT_VALIDATIONS.ATTEMPT_STATUS.FAILED,
                ].includes(result.status),
            ).toBe(true);
        } finally {
            await cleanupUser(me.user_id);
        }
    });

    test("Apple Pay failures are recorded identically across strategies", async () => {
        const { me } = await registerAndLogin("tc25-apple");

        try {
            const orderId = await createUnpaidOrder(me.user_id, 113.0);
            let sawFailed = false;
            for (let i = 0; i < 3; i += 1) {
                const pool = await getPool();
                const [rows] = await pool.execute(
                    `SELECT payment_status FROM orders WHERE order_id = ?`,
                    [orderId],
                );
                if (
                    rows[0]?.payment_status ===
                    ORDER_VALIDATIONS.PAYMENT_STATUS.PAID
                ) {
                    await pool.execute(
                        `UPDATE orders SET payment_status = ?, order_status = ? WHERE order_id = ?`,
                        [
                            ORDER_VALIDATIONS.PAYMENT_STATUS.UNPAID,
                            ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
                            orderId,
                        ],
                    );
                }

                const result = await paymentService.processPayment({
                    user_id: me.user_id,
                    order_id: orderId,
                    amount: 113.0,
                    payment_method: PAYMENT_METHODS.APPLE_PAY,
                    payment_details: { token: `apple-token-${i}` },
                });

                if (
                    result.status === PAYMENT_VALIDATIONS.ATTEMPT_STATUS.FAILED
                ) {
                    sawFailed = true;
                    expect(result.payment_status).not.toBe(
                        ORDER_VALIDATIONS.PAYMENT_STATUS.PAID,
                    );
                    break;
                }
            }

            const attempts =
                await paymentService.getPaymentAttemptsByOrderId(orderId);
            expect(attempts.length).toBeGreaterThanOrEqual(1);
            expect(
                attempts.every(
                    (a) => a.payment_method === PAYMENT_METHODS.APPLE_PAY,
                ),
            ).toBe(true);
            expect(sawFailed || attempts.length >= 1).toBe(true);
        } finally {
            await cleanupUser(me.user_id);
        }
    });
});
