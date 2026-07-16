import { ValidationError } from "../../../utils/errors.js";
import {
    validateProcessPaymentInput,
    validatePaymentAttemptInput,
    validateAttemptId,
    validateUserId,
    ALL_PAYMENT_METHODS,
    ALL_ATTEMPT_STATUSES,
} from "../../../services/payment/paymentValidator.js";
import { VALIDATIONS } from "../../../services/payment/constants.js";

const CARD = {
    card_number: "4111111111111111",
    expiry_month: "12",
    expiry_year: "2030",
    cvv: "123",
    cardholder_name: "Test",
};

describe("paymentValidator", () => {
    test("processPayment credit card happy path", () => {
        const data = validateProcessPaymentInput({
            user_id: 1,
            order_id: 2,
            amount: 113,
            payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
            payment_details: CARD,
        });
        expect(data.order_id).toBe(2);
        expect(ALL_PAYMENT_METHODS).toContain(data.payment_method);
    });

    test("processPayment apple pay requires token", () => {
        expect(() =>
            validateProcessPaymentInput({
                order_id: 1,
                amount: 10,
                payment_method: VALIDATIONS.PAYMENT_METHODS.APPLE_PAY,
                payment_details: {},
            }),
        ).toThrow(ValidationError);

        const ok = validateProcessPaymentInput({
            order_id: 1,
            amount: 10,
            payment_method: VALIDATIONS.PAYMENT_METHODS.APPLE_PAY,
            payment_details: { token: "tok" },
        });
        expect(ok.payment_method).toBe(VALIDATIONS.PAYMENT_METHODS.APPLE_PAY);
    });

    test("processPayment rejects incomplete card details / bad method", () => {
        expect(() =>
            validateProcessPaymentInput({
                order_id: 1,
                amount: 10,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
                payment_details: { card_number: "4111" },
            }),
        ).toThrow(ValidationError);
        expect(() =>
            validateProcessPaymentInput({
                order_id: 1,
                amount: 10,
                payment_method: "bitcoin",
            }),
        ).toThrow(ValidationError);
        expect(() =>
            validateProcessPaymentInput({
                order_id: 1,
                amount: -1,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD,
            }),
        ).toThrow(ValidationError);
    });

    test("paymentAttempt and id helpers", () => {
        const attempt = validatePaymentAttemptInput({
            order_id: 1,
            amount: 50,
            payment_method: VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD,
            status: VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
        });
        expect(ALL_ATTEMPT_STATUSES).toContain(attempt.status);

        expect(() =>
            validatePaymentAttemptInput({
                order_id: 1,
                amount: 50,
                payment_method: VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD,
                status: "nope",
            }),
        ).toThrow(ValidationError);

        expect(validateAttemptId("7")).toBe(7);
        expect(validateUserId(3)).toBe(3);
        expect(() => validateAttemptId(0)).toThrow(ValidationError);
    });
});
