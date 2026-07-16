import { jest } from "@jest/globals";
import {
    ConflictError,
    ValidationError,
    NotFoundError,
    ForbiddenError,
} from "../../../utils/errors.js";
import { VALIDATIONS, CHECKOUT_ACTORS } from "../../../services/order/constants.js";

const mockFindById = jest.fn();
const mockUpdatePaymentStatus = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockCancelOrderWithStockRestore = jest.fn();
const mockCheckout = jest.fn();
const mockGetCheckoutStrategy = jest.fn(() => ({ checkout: mockCheckout }));

await jest.unstable_mockModule("../../../services/order/orderDAO.js", () => ({
    default: {
        findById: mockFindById,
        updatePaymentStatus: mockUpdatePaymentStatus,
        updateOrderStatus: mockUpdateOrderStatus,
        cancelOrderWithStockRestore: mockCancelOrderWithStockRestore,
    },
}));

await jest.unstable_mockModule(
    "../../../services/order/strategies/index.js",
    () => ({
        default: mockGetCheckoutStrategy,
    }),
);

const {
    updatePaymentStatus,
    updateOrderStatus,
    checkout,
} = await import("../../../services/order/orderMutation.js");

describe("orderMutation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCheckoutStrategy.mockReturnValue({ checkout: mockCheckout });
        mockCheckout.mockResolvedValue({ order_id: 1 });
        mockUpdatePaymentStatus.mockResolvedValue(undefined);
        mockUpdateOrderStatus.mockResolvedValue(undefined);
        mockCancelOrderWithStockRestore.mockResolvedValue(undefined);
    });

    test("updatePaymentStatus no-ops when status unchanged", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
        });
        await updatePaymentStatus(1, VALIDATIONS.PAYMENT_STATUS.PAID);
        expect(mockUpdatePaymentStatus).not.toHaveBeenCalled();
    });

    test("updatePaymentStatus rejects illegal transition", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
        });
        await expect(
            updatePaymentStatus(1, VALIDATIONS.PAYMENT_STATUS.UNPAID),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("updatePaymentStatus applies allowed transition", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
        });
        await updatePaymentStatus(1, VALIDATIONS.PAYMENT_STATUS.PAID);
        expect(mockUpdatePaymentStatus).toHaveBeenCalledWith(
            1,
            VALIDATIONS.PAYMENT_STATUS.PAID,
        );
    });

    test("updateOrderStatus rejects illegal transition", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            order_status: VALIDATIONS.ORDER_STATUS.DELIVERED,
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
        });
        await expect(
            updateOrderStatus(1, VALIDATIONS.ORDER_STATUS.PENDING),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("updateOrderStatus requires paid before ship/deliver", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            order_status: VALIDATIONS.ORDER_STATUS.CONFIRMED,
            payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
        });
        await expect(
            updateOrderStatus(1, VALIDATIONS.ORDER_STATUS.SHIPPED),
        ).rejects.toMatchObject({
            message: expect.stringMatching(/must be paid/i),
        });
    });

    test("updateOrderStatus cancel restores stock unless payment failed", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            order_status: VALIDATIONS.ORDER_STATUS.PENDING,
            payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
        });
        await updateOrderStatus(1, VALIDATIONS.ORDER_STATUS.CANCELLED);
        expect(mockCancelOrderWithStockRestore).toHaveBeenCalledWith(1, true);

        mockFindById.mockResolvedValue({
            order_id: 2,
            order_status: VALIDATIONS.ORDER_STATUS.PENDING,
            payment_status: VALIDATIONS.PAYMENT_STATUS.FAILED,
        });
        await updateOrderStatus(2, VALIDATIONS.ORDER_STATUS.CANCELLED);
        expect(mockCancelOrderWithStockRestore).toHaveBeenCalledWith(2, false);
    });

    test("updateOrderStatus applies non-cancel transition", async () => {
        mockFindById.mockResolvedValue({
            order_id: 1,
            order_status: VALIDATIONS.ORDER_STATUS.PENDING,
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
        });
        await updateOrderStatus(1, VALIDATIONS.ORDER_STATUS.CONFIRMED);
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
            1,
            VALIDATIONS.ORDER_STATUS.CONFIRMED,
        );
    });

    test("checkout resolves actor from userId and rejects unknown actor", async () => {
        await expect(
            checkout({
                actor: "alien",
                shipping_address: {},
                payment_method: "credit_card",
            }),
        ).rejects.toBeInstanceOf(ValidationError);

        // guest path via omitted actor + null userId still needs valid guest input
        await expect(
            checkout({
                actor: CHECKOUT_ACTORS.GUEST,
                guest_email: "g@test.com",
                items: [{ cid: 1, quantity: 1 }],
                shipping_address: {
                    full_name: "G",
                    street: "1",
                    city: "Toronto",
                    province: "ON",
                    country: "Canada",
                    postal_code: "M5H2N2",
                },
                payment_method: "credit_card",
                payment_details: {
                    card_number: "4111111111111111",
                    expiry_month: "12",
                    expiry_year: "2030",
                    cvv: "123",
                    cardholder_name: "G",
                },
            }),
        ).resolves.toEqual({ order_id: 1 });
        expect(mockGetCheckoutStrategy).toHaveBeenCalledWith(
            CHECKOUT_ACTORS.GUEST,
        );
    });
});
