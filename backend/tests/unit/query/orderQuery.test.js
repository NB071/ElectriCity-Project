import { jest } from "@jest/globals";
import {
    NotFoundError,
    ForbiddenError,
    ConflictError,
    ValidationError,
} from "../../../utils/errors.js";
import { VALIDATIONS } from "../../../services/order/constants.js";

const mockExistsById = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdWithUser = jest.fn();
const mockCountOrdersByUserId = jest.fn();
const mockFindOrdersByUserId = jest.fn();
const mockCountAllOrders = jest.fn();
const mockFindAllOrders = jest.fn();
const mockFindItemsByOrderId = jest.fn();
const mockFindAddressesByOrderId = jest.fn();
const mockFindOptionsByConfigId = jest.fn();
const mockGetPaymentAttemptsByOrderId = jest.fn();
const mockResolvePricedCheckoutLines = jest.fn();
const mockFindCartByUserId = jest.fn();
const mockFindActiveGuestCartBySessionToken = jest.fn();

await jest.unstable_mockModule("../../../services/order/orderDAO.js", () => ({
    default: {
        existsById: mockExistsById,
        findById: mockFindById,
        findByIdWithUser: mockFindByIdWithUser,
        countOrdersByUserId: mockCountOrdersByUserId,
        findOrdersByUserId: mockFindOrdersByUserId,
        countAllOrders: mockCountAllOrders,
        findAllOrders: mockFindAllOrders,
        findItemsByOrderId: mockFindItemsByOrderId,
        findAddressesByOrderId: mockFindAddressesByOrderId,
        resolvePricedCheckoutLines: mockResolvePricedCheckoutLines,
    },
}));

await jest.unstable_mockModule("../../../services/cart/cartDAO.js", () => ({
    default: {
        findCartByUserId: mockFindCartByUserId,
        findActiveGuestCartBySessionToken: mockFindActiveGuestCartBySessionToken,
    },
}));

await jest.unstable_mockModule(
    "../../../services/catalog/_configurations/configurationsDAO.js",
    () => ({
        default: {
            findOptionsByConfigId: mockFindOptionsByConfigId,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/payment/payment.service.js",
    () => ({
        default: {
            getPaymentAttemptsByOrderId: mockGetPaymentAttemptsByOrderId,
        },
    }),
);

const {
    ensureOrderExists,
    validateOrderForPayment,
    listOrdersByUserId,
    getOrderDetailsForUser,
    listAllOrders,
    getOrderDetailsForAdmin,
    calculateCheckoutTotals,
} = await import("../../../services/order/orderQuery.js");

const orderRow = {
    order_id: 10,
    user_id: 7,
    guest_email: null,
    order_status: VALIDATIONS.ORDER_STATUS.PENDING,
    payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
    subtotal: 100,
    tax: 13,
    total: 113,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
};

describe("orderQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFindItemsByOrderId.mockResolvedValue([]);
        mockFindAddressesByOrderId.mockResolvedValue([]);
        mockGetPaymentAttemptsByOrderId.mockResolvedValue([]);
        mockFindOptionsByConfigId.mockResolvedValue([]);
    });

    test("ensureOrderExists throws when missing", async () => {
        mockExistsById.mockResolvedValue(false);
        await expect(ensureOrderExists(1)).rejects.toBeInstanceOf(NotFoundError);

        mockExistsById.mockResolvedValue(true);
        await expect(ensureOrderExists(1)).resolves.toBe(1);
    });

    test("validateOrderForPayment enforces ownership/status/amount", async () => {
        mockFindById.mockResolvedValueOnce(null);
        await expect(
            validateOrderForPayment({ order_id: 1, user_id: 7, amount: 113 }),
        ).rejects.toBeInstanceOf(NotFoundError);

        mockFindById.mockResolvedValueOnce({ ...orderRow, user_id: null });
        await expect(
            validateOrderForPayment({ order_id: 10, user_id: 7, amount: 113 }),
        ).rejects.toBeInstanceOf(ForbiddenError);

        mockFindById.mockResolvedValueOnce({
            ...orderRow,
            payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
        });
        await expect(
            validateOrderForPayment({ order_id: 10, user_id: 7, amount: 113 }),
        ).rejects.toBeInstanceOf(ConflictError);

        mockFindById.mockResolvedValueOnce({
            ...orderRow,
            order_status: VALIDATIONS.ORDER_STATUS.CANCELLED,
        });
        await expect(
            validateOrderForPayment({ order_id: 10, user_id: 7, amount: 113 }),
        ).rejects.toBeInstanceOf(ConflictError);

        mockFindById.mockResolvedValueOnce(orderRow);
        await expect(
            validateOrderForPayment({ order_id: 10, user_id: 7, amount: 999 }),
        ).rejects.toBeInstanceOf(ValidationError);

        mockFindById.mockResolvedValueOnce(orderRow);
        await expect(
            validateOrderForPayment({ order_id: 10, user_id: 7, amount: 113 }),
        ).resolves.toMatchObject({ order_id: 10 });
    });

    test("listOrdersByUserId empty vs filled and bad pagination", async () => {
        await expect(listOrdersByUserId(7, { page: 0 })).rejects.toBeInstanceOf(
            ValidationError,
        );

        mockCountOrdersByUserId.mockResolvedValueOnce(0);
        const empty = await listOrdersByUserId(7, { page: 1, limit: 10 });
        expect(empty.items).toEqual([]);
        expect(mockFindOrdersByUserId).not.toHaveBeenCalled();

        mockCountOrdersByUserId.mockResolvedValueOnce(1);
        mockFindOrdersByUserId.mockResolvedValueOnce([
            { ...orderRow, item_count: 1 },
        ]);
        const filled = await listOrdersByUserId(7, { page: 1, limit: 10 });
        expect(filled.items).toHaveLength(1);
    });

    test("listAllOrders empty vs filled and bad pagination", async () => {
        await expect(listAllOrders({ page: -1 })).rejects.toBeInstanceOf(
            ValidationError,
        );

        mockCountAllOrders.mockResolvedValueOnce(0);
        const empty = await listAllOrders({ page: 1, limit: 10 });
        expect(empty.items).toEqual([]);

        mockCountAllOrders.mockResolvedValueOnce(1);
        mockFindAllOrders.mockResolvedValueOnce([
            { ...orderRow, item_count: 1, first_name: "A", last_name: "B", email: "a@b.com" },
        ]);
        const filled = await listAllOrders({ page: 1, limit: 10 });
        expect(filled.items).toHaveLength(1);
    });

    test("getOrderDetailsForUser forbids foreign orders", async () => {
        mockFindById.mockResolvedValue({ ...orderRow, user_id: 99 });
        await expect(getOrderDetailsForUser(7, 10)).rejects.toBeInstanceOf(
            ForbiddenError,
        );
    });

    test("getOrderDetailsForUser and admin assemble options for configs", async () => {
        mockFindById.mockResolvedValue(orderRow);
        mockFindItemsByOrderId.mockResolvedValue([
            {
                order_item_id: 1,
                order_id: 10,
                cid: 1,
                config_id: 5,
                quantity: 1,
                unit_price: 100,
                item_type: "vehicle",
                base_price: 90,
                is_active: 1,
                brand_name: "Tesla",
                model_name: "Model 3",
                config_total_price: 100,
                config_created_at: "2025-01-01",
            },
            {
                order_item_id: 2,
                order_id: 10,
                cid: 2,
                config_id: null,
                quantity: 1,
                unit_price: 50,
                item_type: "vehicle",
                base_price: 50,
                is_active: 1,
                brand_name: "Nissan",
                model_name: "Leaf",
                config_total_price: null,
                config_created_at: null,
            },
        ]);
        mockFindOptionsByConfigId.mockResolvedValue([
            {
                category_id: 1,
                category_name: "Paint",
                select_type: "SINGLE",
                option_id: 9,
                option_name: "Red",
                price_delta: 0,
            },
        ]);

        const detail = await getOrderDetailsForUser(7, 10);
        expect(detail).toBeDefined();
        expect(mockFindOptionsByConfigId).toHaveBeenCalledWith(5);

        mockFindByIdWithUser.mockResolvedValue({
            ...orderRow,
            first_name: "A",
            last_name: "B",
            email: "a@b.com",
        });
        const admin = await getOrderDetailsForAdmin(10);
        expect(admin).toBeDefined();
    });

    test("calculateCheckoutTotals returns tax_breakdown for customer cart", async () => {
        mockFindCartByUserId.mockResolvedValue({ cart_id: 55 });
        mockResolvePricedCheckoutLines.mockResolvedValue([
            { cid: 1, config_id: null, quantity: 1, unit_price: 1000 },
        ]);

        const result = await calculateCheckoutTotals({
            actor: VALIDATIONS.CHECKOUT_ACTORS[0],
            userId: 7,
            shipping_address: { province: "ON" },
        });

        expect(mockResolvePricedCheckoutLines).toHaveBeenCalledWith({
            cartId: 55,
        });
        expect(result.province).toBe("ON");
        expect(result.subtotal).toBe(1000);
        expect(result.tax).toBe(130);
        expect(result.total).toBe(1130);
        expect(result.tax_breakdown.amounts).toEqual({
            gst: 0,
            pst: 0,
            hst: 130,
            tax: 130,
        });
        expect(result.items[0].line_total).toBe(1000);
    });

    test("calculateCheckoutTotals uses guest items when no session cart", async () => {
        mockResolvePricedCheckoutLines.mockResolvedValue([
            { cid: 3, config_id: null, quantity: 2, unit_price: 50 },
        ]);

        const result = await calculateCheckoutTotals({
            actor: "guest",
            items: [{ cid: 3, quantity: 2 }],
            shipping_address: { province: "AB" },
        });

        expect(mockResolvePricedCheckoutLines).toHaveBeenCalledWith({
            items: [{ cid: 3, quantity: 2 }],
        });
        expect(result.tax_breakdown.type).toBe("gst");
        expect(result.tax).toBe(5);
        expect(result.total).toBe(105);
    });
});
