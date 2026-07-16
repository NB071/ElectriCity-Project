import { jest } from "@jest/globals";
import { VALIDATIONS } from "../../../services/order/constants.js";
import {
    ConflictError,
    ValidationError,
} from "../../../utils/errors.js";

const mockCreateOrderWithItems = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockFindById = jest.fn();
const mockRestoreStockForItems = jest.fn();
const mockUpdatePaymentStatus = jest.fn();
const mockRestoreCartItems = jest.fn();
const mockProcessPayment = jest.fn();
const mockValidateOrderForPayment = jest.fn();

await jest.unstable_mockModule("../../../services/order/orderDAO.js", () => ({
    default: {
        createOrderWithItems: mockCreateOrderWithItems,
        updateOrderStatus: mockUpdateOrderStatus,
        findById: mockFindById,
        restoreStockForItems: mockRestoreStockForItems,
        updatePaymentStatus: mockUpdatePaymentStatus,
        restoreCartItems: mockRestoreCartItems,
    },
}));

await jest.unstable_mockModule("../../../services/payment/payment.service.js", () => ({
    default: { processPayment: mockProcessPayment },
}));

await jest.unstable_mockModule("../../../services/order/orderQuery.js", () => ({
    validateOrderForPayment: mockValidateOrderForPayment,
}));

const { runCheckout } = await import(
    "../../../services/order/strategies/checkoutHelpers.js"
);

const shipping = {
    full_name: "Test User",
    street: "1 Main",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    postal_code: "M5H2N2",
};

const createdOrder = {
    order_id: 100,
    subtotal: 200,
    tax: 26,
    total: 226,
    resolvedItems: [{ cid: 1, quantity: 1, unit_price: 200 }],
    cartId: 5,
    clearedCartLines: [{ cid: 1, config_id: null, quantity: 1 }],
};

describe("runCheckout", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateOrderWithItems.mockResolvedValue(createdOrder);
        mockFindById.mockResolvedValue({
            order_id: 100,
            payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
        });
        mockRestoreStockForItems.mockResolvedValue(undefined);
        mockUpdatePaymentStatus.mockResolvedValue(undefined);
        mockRestoreCartItems.mockResolvedValue(undefined);
        mockUpdateOrderStatus.mockResolvedValue(undefined);
        mockValidateOrderForPayment.mockResolvedValue(undefined);
    });

    test("rejects invalid province before creating order", async () => {
        await expect(
            runCheckout({
                userId: 1,
                shipping_address: { ...shipping, province: "Narnia" },
                payment_method: "credit_card",
            }),
        ).rejects.toBeInstanceOf(ValidationError);

        expect(mockCreateOrderWithItems).not.toHaveBeenCalled();
    });

    test("guest checkout succeeds when payment is paid", async () => {
        mockProcessPayment.mockResolvedValue({
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
            attempt_id: 1,
            status: "approved",
            payment_method: "credit_card",
        });

        const result = await runCheckout({
            userId: null,
            guest_email: "guest@test.com",
            items: [{ cid: 1, quantity: 1 }],
            shipping_address: shipping,
            payment_method: "credit_card",
            payment_details: { card_number: "4111111111111111" },
        });

        expect(result.order_status).toBe(VALIDATIONS.ORDER_STATUS.CONFIRMED);
        expect(mockValidateOrderForPayment).not.toHaveBeenCalled();
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
            100,
            VALIDATIONS.ORDER_STATUS.CONFIRMED,
        );
    });

    test("customer checkout validates ownership before charging", async () => {
        mockProcessPayment.mockResolvedValue({
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
            attempt_id: 2,
            status: "approved",
            payment_method: "credit_card",
        });

        await runCheckout({
            userId: 9,
            cartId: 5,
            shipping_address: shipping,
            payment_method: "credit_card",
        });

        expect(mockValidateOrderForPayment).toHaveBeenCalledWith({
            order_id: 100,
            user_id: 9,
            amount: 226,
        });
    });

    test("declined payment compensates and throws ConflictError", async () => {
        mockProcessPayment.mockResolvedValue({
            payment_status: VALIDATIONS.PAYMENT_STATUS.FAILED,
            attempt_id: 3,
            status: "declined",
            payment_method: "credit_card",
        });

        await expect(
            runCheckout({
                userId: null,
                guest_email: "guest@test.com",
                items: [{ cid: 1, quantity: 1 }],
                shipping_address: shipping,
                payment_method: "credit_card",
            }),
        ).rejects.toBeInstanceOf(ConflictError);

        expect(mockRestoreStockForItems).toHaveBeenCalledWith(
            createdOrder.resolvedItems,
        );
        expect(mockUpdatePaymentStatus).toHaveBeenCalledWith(
            100,
            VALIDATIONS.PAYMENT_STATUS.FAILED,
        );
        expect(mockRestoreCartItems).toHaveBeenCalledWith(
            5,
            createdOrder.clearedCartLines,
        );
        expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
    });

    test("compensation skips restore when order already paid", async () => {
        mockProcessPayment.mockRejectedValue(new Error("gateway timeout"));
        mockFindById.mockResolvedValue({
            order_id: 100,
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
        });

        await expect(
            runCheckout({
                userId: 1,
                cartId: 5,
                shipping_address: shipping,
                payment_method: "credit_card",
            }),
        ).rejects.toThrow("gateway timeout");

        expect(mockRestoreStockForItems).not.toHaveBeenCalled();
        expect(mockUpdatePaymentStatus).not.toHaveBeenCalled();
    });

    test("rethrows payment ConflictError without double compensation", async () => {
        const declined = new ConflictError("Payment was declined.", {
            order_id: 100,
            payment_status: VALIDATIONS.PAYMENT_STATUS.FAILED,
        });
        mockProcessPayment.mockRejectedValue(declined);

        await expect(
            runCheckout({
                userId: 1,
                cartId: 5,
                shipping_address: shipping,
                payment_method: "credit_card",
            }),
        ).rejects.toBe(declined);

        expect(mockRestoreStockForItems).not.toHaveBeenCalled();
    });
});
