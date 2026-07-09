// Payment service tests
// script: npm run test:payment

import paymentService from "../../services/payment/payment.service.js";
import orderService from "../../services/order/order.service.js";
import {
    validateProcessPaymentInput,
} from "../../services/payment/paymentValidator.js";
import getPool from "../../configs/db.js";
import {
    ValidationError,
    NotFoundError,
    ForbiddenError,
    ConflictError,
} from "../../utils/errors.js";
import { VALIDATIONS as PAYMENT_VALIDATIONS } from "../../services/payment/constants.js";
import { VALIDATIONS as ORDER_VALIDATIONS } from "../../services/order/constants.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const CARD_DETAILS = {
    card_number: "4111111111111111",
    expiry_month: "12",
    expiry_year: "2030",
    cvv: "123",
    cardholder_name: "Test User",
};

function testProcessPaymentValidator() {
    const valid = validateProcessPaymentInput({
        user_id: 1,
        order_id: 1,
        amount: 100,
        payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
        payment_details: CARD_DETAILS,
    });

    assert(
        valid.payment_method === PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
        "credit card payment method should be accepted",
    );

    const applePay = validateProcessPaymentInput({
        user_id: 1,
        order_id: 1,
        amount: 100,
        payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.APPLE_PAY,
        payment_details: { token: "apple-pay-token" },
    });

    assert(
        applePay.payment_method === PAYMENT_VALIDATIONS.PAYMENT_METHODS.APPLE_PAY,
        "apple pay payment method should be accepted",
    );

    try {
        validateProcessPaymentInput({
            user_id: 1,
            order_id: 1,
            amount: 100,
            payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
            payment_details: { card_number: "4111111111111111" },
        });
        throw new Error("Expected missing card fields validation to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "incomplete card details should throw ValidationError",
        );
    }

    const guest = validateProcessPaymentInput({
        order_id: 1,
        amount: 100,
        payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
        payment_details: CARD_DETAILS,
    });
    assert(guest.user_id === null, "omitted user_id should normalize to null");

    const guestExplicit = validateProcessPaymentInput({
        user_id: null,
        order_id: 1,
        amount: 100,
        payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
        payment_details: CARD_DETAILS,
    });
    assert(
        guestExplicit.user_id === null,
        "explicit null user_id should be accepted for guest checkout",
    );

    console.log("SUCCESS: process payment validator checks passed");
}

async function createUnpaidGuestOrder(total = 113.0) {
    const pool = await getPool();
    const subtotal = 100.0;
    const tax = 13.0;

    const [result] = await pool.execute(
        `INSERT INTO orders (user_id, guest_email, order_status, payment_status, subtotal, tax, total)
         VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
        [
            `guest-${Date.now()}@example.com`,
            ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
            ORDER_VALIDATIONS.PAYMENT_STATUS.FAILED,
            subtotal,
            tax,
            total,
        ],
    );

    return result.insertId;
}

async function createUnpaidOrder(userId, total = 113.0) {
    const pool = await getPool();
    const subtotal = 100.0;
    const tax = 13.0;

    const [result] = await pool.execute(
        `INSERT INTO orders (user_id, order_status, payment_status, subtotal, tax, total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userId,
            ORDER_VALIDATIONS.ORDER_STATUS.PENDING,
            ORDER_VALIDATIONS.PAYMENT_STATUS.FAILED,
            subtotal,
            tax,
            total,
        ],
    );

    return result.insertId;
}

async function deleteOrder(orderId) {
    const pool = await getPool();
    await pool.execute(`DELETE FROM payment_attempts WHERE order_id = ?`, [
        orderId,
    ]);
    await pool.execute(`DELETE FROM orders WHERE order_id = ?`, [orderId]);
}

async function testValidateOrderForPayment() {
    const orderId = await createUnpaidOrder(1);

    try {
        await orderService.validateOrderForPayment({
            order_id: orderId,
            user_id: 2,
            amount: 113.0,
        });
        throw new Error("Expected forbidden for wrong user");
    } catch (error) {
        assert(
            error instanceof ForbiddenError,
            "wrong user should throw ForbiddenError",
        );
    }

    try {
        await orderService.validateOrderForPayment({
            order_id: orderId,
            user_id: 1,
            amount: 99.99,
        });
        throw new Error("Expected amount mismatch validation to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "amount mismatch should throw ValidationError",
        );
    }

    try {
        await orderService.validateOrderForPayment({
            order_id: 1,
            user_id: 1,
            amount: 66658.7,
        });
        throw new Error("Expected already paid conflict");
    } catch (error) {
        assert(
            error instanceof ConflictError,
            "already paid order should throw ConflictError",
        );
    }

    await deleteOrder(orderId);
    console.log("SUCCESS: validate order for payment checks passed");
}

async function testProcessPaymentFlow() {
    const orderId = await createUnpaidOrder(1, 113.0);

    const result = await paymentService.processPayment({
        user_id: 1,
        order_id: orderId,
        amount: 113.0,
        payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
        payment_details: CARD_DETAILS,
    });

    assert(result.attempt_id > 0, "processPayment should return attempt_id");
    assert(
        result.payment_status === ORDER_VALIDATIONS.PAYMENT_STATUS.PAID ||
            result.payment_status === ORDER_VALIDATIONS.PAYMENT_STATUS.FAILED,
        "processPayment should return order payment_status",
    );
    assert(
        result.status === PAYMENT_VALIDATIONS.ATTEMPT_STATUS.SUCCESS ||
            result.status === PAYMENT_VALIDATIONS.ATTEMPT_STATUS.FAILED,
        "processPayment should return attempt status",
    );

    if (result.payment_status === ORDER_VALIDATIONS.PAYMENT_STATUS.PAID) {
        try {
            await orderService.validateOrderForPayment({
                order_id: orderId,
                user_id: 1,
                amount: 113.0,
            });
            throw new Error("Expected already paid conflict after successful payment");
        } catch (error) {
            assert(
                error instanceof ConflictError,
                "paid order should not be payable again",
            );
        }
    }

    const attempts = await paymentService.getPaymentAttemptsByOrderId(orderId);
    assert(attempts.length === 1, "order should have one payment attempt");

    const history = await paymentService.getPaymentAttemptsByUserId(1, {
        page: 1,
        limit: 10,
    });
    assert(
        history.items.some((item) => item.order_id === orderId),
        "customer history should include the new attempt",
    );

    await deleteOrder(orderId);
    console.log("SUCCESS: process payment flow checks passed");
}

async function testGuestCheckoutFlow() {
    const orderId = await createUnpaidGuestOrder(113.0);

    const result = await paymentService.processPayment({
        order_id: orderId,
        amount: 113.0,
        payment_method: PAYMENT_VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
        payment_details: CARD_DETAILS,
    });

    assert(result.attempt_id > 0, "guest processPayment should return attempt_id");
    assert(result.order_id === orderId, "guest payment should reference the order");

    const attempts = await paymentService.getPaymentAttemptsByOrderId(orderId);
    assert(attempts.length === 1, "guest order should have one payment attempt");
    assert(
        attempts[0].user_id == null,
        "guest payment attempt should have null user_id",
    );

    await deleteOrder(orderId);
    console.log("SUCCESS: guest checkout flow checks passed");
}

async function testGetPaymentAttemptByIdNotFound() {
    try {
        await paymentService.getPaymentAttemptById(999999);
        throw new Error("Expected not found for bogus attempt id");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "bogus attempt id should throw NotFoundError",
        );
    }

    console.log("SUCCESS: get payment attempt by id not found check passed");
}

async function testGetPaymentAttemptsByOrderIdEmpty() {
    const attempts = await paymentService.getPaymentAttemptsByOrderId(999999);
    assert(
        Array.isArray(attempts) && attempts.length === 0,
        "unknown order id should return an empty attempt list",
    );

    console.log("SUCCESS: get payment attempts by order id empty check passed");
}

async function run() {
    testProcessPaymentValidator();

    try {
        await getPool();
    } catch {
        console.log(
            "SKIP: database integration tests (start Docker and apply schema/seed)",
        );
        return;
    }

    await testValidateOrderForPayment();
    await testProcessPaymentFlow();
    await testGuestCheckoutFlow();
    await testGetPaymentAttemptByIdNotFound();
    await testGetPaymentAttemptsByOrderIdEmpty();

    console.log("ALL PAYMENT TESTS PASSED");
}

run().catch((error) => {
    console.error("PAYMENT TESTS FAILED:", error.message);
    process.exit(1);
});
