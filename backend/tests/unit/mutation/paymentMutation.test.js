import { jest } from "@jest/globals";
import {
    AppError,
    PaymentError,
    ValidationError,
} from "../../../utils/errors.js";
import { VALIDATIONS } from "../../../services/payment/constants.js";

const mockProcess = jest.fn();
const mockInsertPaymentAttempt = jest.fn();
const mockUpdatePaymentStatus = jest.fn();
const mockGetStrategy = jest.fn(() => ({ process: mockProcess }));
const mockSetSafeContext = jest.fn();

await jest.unstable_mockModule(
    "../../../services/payment/strategies/index.js",
    () => ({
        default: mockGetStrategy,
    }),
);

await jest.unstable_mockModule("../../../services/payment/paymentDAO.js", () => ({
    default: {
        insertPaymentAttempt: mockInsertPaymentAttempt,
    },
}));

await jest.unstable_mockModule("../../../services/order/order.service.js", () => ({
    default: {
        updatePaymentStatus: mockUpdatePaymentStatus,
        VALIDATIONS: {
            PAYMENT_STATUS: {
                PAID: "paid",
                FAILED: "failed",
            },
        },
    },
}));

await jest.unstable_mockModule("../../../utils/sentryHelpers.js", () => ({
    setSafeContext: mockSetSafeContext,
}));

const {
    processPayment,
    recordPaymentAttempt,
    updateOrderPaymentStatus,
} = await import("../../../services/payment/paymentMutation.js");

const CARD = {
    card_number: "4111111111111111",
    expiry_month: "12",
    expiry_year: "2030",
    cvv: "123",
    cardholder_name: "Test User",
};

describe("paymentMutation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetStrategy.mockReturnValue({ process: mockProcess });
        mockInsertPaymentAttempt.mockResolvedValue({ attempt_id: 9 });
        mockUpdatePaymentStatus.mockResolvedValue(undefined);
    });

    test("processPayment success path marks order paid", async () => {
        mockProcess.mockResolvedValue({
            status: VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
        });

        const result = await processPayment({
            user_id: 1,
            order_id: 10,
            amount: 100,
            payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
            payment_details: CARD,
        });

        expect(result.payment_status).toBe("paid");
        expect(result.attempt_id).toBe(9);
        expect(mockUpdatePaymentStatus).toHaveBeenCalledWith(10, "paid");
        expect(mockSetSafeContext).toHaveBeenCalledWith({ user_id: 1 });
    });

    test("processPayment failed gateway status marks order failed", async () => {
        mockProcess.mockResolvedValue({
            status: VALIDATIONS.ATTEMPT_STATUS.FAILED,
        });

        const result = await processPayment({
            order_id: 11,
            amount: 50,
            payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
            payment_details: CARD,
        });

        expect(result.payment_status).toBe("failed");
        expect(mockUpdatePaymentStatus).toHaveBeenCalledWith(11, "failed");
    });

    test("processPayment rethrows AppError from strategy", async () => {
        const err = new ValidationError("card declined at validator layer");
        mockProcess.mockRejectedValue(err);

        await expect(
            processPayment({
                order_id: 12,
                amount: 50,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD,
            }),
        ).rejects.toBe(err);

        expect(mockInsertPaymentAttempt).not.toHaveBeenCalled();
    });

    test("processPayment wraps unexpected strategy errors as PaymentError", async () => {
        mockProcess.mockRejectedValue(new Error("socket hang up"));

        await expect(
            processPayment({
                order_id: 13,
                amount: 50,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD,
            }),
        ).rejects.toBeInstanceOf(PaymentError);

        await expect(
            processPayment({
                order_id: 13,
                amount: 50,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD,
            }),
        ).rejects.toMatchObject({
            details: {
                order_id: 13,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
            },
        });
    });

    test("processPayment rethrows generic AppError subclasses", async () => {
        const boom = new AppError("gateway mapped failure", {
            status: 502,
            code: "PAYMENT_ERROR",
        });
        mockProcess.mockRejectedValue(boom);

        await expect(
            processPayment({
                order_id: 14,
                amount: 50,
                payment_method: VALIDATIONS.PAYMENT_METHODS.CREDIT_CARD,
                payment_details: CARD,
            }),
        ).rejects.toBe(boom);
    });

    test("recordPaymentAttempt inserts and returns attempt_id", async () => {
        const result = await recordPaymentAttempt({
            order_id: 20,
            user_id: 3,
            amount: 75,
            payment_method: VALIDATIONS.PAYMENT_METHODS.DEBIT_CARD,
            status: VALIDATIONS.ATTEMPT_STATUS.SUCCESS,
            payment_details: CARD,
        });

        expect(result.attempt_id).toBe(9);
        expect(mockInsertPaymentAttempt).toHaveBeenCalled();
    });

    test("updateOrderPaymentStatus delegates to order service", async () => {
        await updateOrderPaymentStatus(30, "paid");
        expect(mockUpdatePaymentStatus).toHaveBeenCalledWith(30, "paid");
    });
});
