import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import {
    NotFoundError,
    ValidationError,
} from "../../../utils/errors.js";
import { VALIDATIONS } from "../../../services/order/constants.js";

const { execute, connExecute, getPool } = createMockPool();
await mockDbModule(getPool);

const orderDAO = (await import("../../../services/order/orderDAO.js")).default;

const shippingAddress = {
    address_type: "shipping",
    full_name: "Test User",
    street: "1 Main",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    postal_code: "M5H2N2",
};

describe("orderDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("existsById reflects row presence", async () => {
        execute.mockResolvedValueOnce([[{ 1: 1 }], []]);
        await expect(orderDAO.existsById(1)).resolves.toBe(true);

        execute.mockResolvedValueOnce([[], []]);
        await expect(orderDAO.existsById(2)).resolves.toBe(false);
    });

    test("findById throws when order missing", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await expect(orderDAO.findById(404)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("restoreStockForItems and restoreCartItems no-op on empty input", async () => {
        await orderDAO.restoreStockForItems([]);
        await orderDAO.restoreCartItems(1, []);
        expect(execute).not.toHaveBeenCalled();
    });

    test("createOrderWithItems rejects empty cart", async () => {
        connExecute
            .mockResolvedValueOnce([[{ cart_id: 1 }], []])
            .mockResolvedValueOnce([[], []]);

        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: 1, guest_email: null },
                addresses: [shippingAddress],
                cartId: 1,
                taxRate: 0.13,
            }),
        ).rejects.toMatchObject({ message: "Your cart is empty." });
    });

    test("createOrderWithItems rejects missing body items", async () => {
        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: null, guest_email: "g@example.com" },
                addresses: [shippingAddress],
                items: [],
                taxRate: 0.13,
            }),
        ).rejects.toMatchObject({
            message: "items must contain at least one line item.",
        });
    });

    test("createOrderWithItems rejects inactive catalog item", async () => {
        connExecute
            .mockResolvedValueOnce([
                [{ cid: 10, base_price: "45000", quantity: 2, is_active: 0 }],
                [],
            ]);

        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: null, guest_email: "g@example.com" },
                addresses: [shippingAddress],
                items: [{ cid: 10, quantity: 1 }],
                taxRate: 0.13,
            }),
        ).rejects.toMatchObject({
            message: "Catalog item 10 is not available.",
        });
    });

    test("createOrderWithItems rejects insufficient stock", async () => {
        connExecute.mockResolvedValueOnce([
            [{ cid: 10, base_price: "45000", quantity: 1, is_active: 1 }],
            [],
        ]);

        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: null, guest_email: "g@example.com" },
                addresses: [shippingAddress],
                items: [{ cid: 10, quantity: 3 }],
                taxRate: 0.13,
            }),
        ).rejects.toMatchObject({
            message:
                "Insufficient stock for catalog item 10. Requested 3, available 1.",
        });
    });

    test("createOrderWithItems validates configuration ownership", async () => {
        connExecute
            .mockResolvedValueOnce([
                [{ cid: 10, base_price: "45000", quantity: 5, is_active: 1 }],
                [],
            ])
            .mockResolvedValueOnce([
                [{ config_id: 99, cid: 11, total_price: "50000" }],
                [],
            ]);

        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: null, guest_email: "g@example.com" },
                addresses: [shippingAddress],
                items: [{ cid: 10, config_id: 99, quantity: 1 }],
                taxRate: 0.13,
            }),
        ).rejects.toMatchObject({
            message: "config_id 99 does not belong to cid 10.",
        });
    });

    test("createOrderWithItems creates order from body items without config", async () => {
        connExecute
            .mockResolvedValueOnce([
                [{ cid: 10, base_price: "100.00", quantity: 5, is_active: 1 }],
                [],
            ])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ insertId: 500, affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        const created = await orderDAO.createOrderWithItems({
            order: { user_id: null, guest_email: "guest@test.com" },
            addresses: [shippingAddress],
            items: [{ cid: 10, quantity: 2 }],
            taxRate: 0.13,
        });

        expect(created.order_id).toBe(500);
        expect(created.subtotal).toBe(200);
        expect(created.resolvedItems[0].unit_price).toBe(100);
        expect(created.cartId).toBeNull();
        expect(created.clearedCartLines).toBeNull();
    });

    test("cancelOrderWithStockRestore is idempotent when already cancelled", async () => {
        connExecute.mockResolvedValueOnce([
            [
                {
                    order_id: 1,
                    order_status: VALIDATIONS.ORDER_STATUS.CANCELLED,
                    payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
                },
            ],
            [],
        ]);

        await expect(
            orderDAO.cancelOrderWithStockRestore(1, true),
        ).resolves.toBeUndefined();
        expect(connExecute).toHaveBeenCalledTimes(1);
    });

    test("cancelOrderWithStockRestore restores stock when requested", async () => {
        connExecute
            .mockResolvedValueOnce([
                [
                    {
                        order_id: 1,
                        order_status: VALIDATIONS.ORDER_STATUS.PENDING,
                        payment_status: VALIDATIONS.PAYMENT_STATUS.UNPAID,
                    },
                ],
                [],
            ])
            .mockResolvedValueOnce([[{ cid: 10, quantity: 2 }], []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await orderDAO.cancelOrderWithStockRestore(1, true);
        expect(connExecute).toHaveBeenCalledTimes(4);
    });

    test("cancelOrderWithStockRestore skips stock restore when disabled", async () => {
        connExecute
            .mockResolvedValueOnce([
                [
                    {
                        order_id: 1,
                        order_status: VALIDATIONS.ORDER_STATUS.CONFIRMED,
                        payment_status: VALIDATIONS.PAYMENT_STATUS.PAID,
                    },
                ],
                [],
            ])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await orderDAO.cancelOrderWithStockRestore(1, false);
        expect(connExecute).toHaveBeenCalledTimes(2);
    });

    test("cancelOrderWithStockRestore throws when order missing", async () => {
        connExecute.mockResolvedValueOnce([[], []]);
        await expect(
            orderDAO.cancelOrderWithStockRestore(404, true),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("createOrderWithItems rejects missing cart / catalog / configuration", async () => {
        connExecute.mockResolvedValueOnce([[], []]);
        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: 1, guest_email: null },
                addresses: [shippingAddress],
                cartId: 99,
                taxRate: 0.13,
            }),
        ).rejects.toBeInstanceOf(NotFoundError);

        connExecute.mockResolvedValueOnce([[], []]);
        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: null, guest_email: "g@test.com" },
                addresses: [shippingAddress],
                items: [{ cid: 404, quantity: 1 }],
                taxRate: 0.13,
            }),
        ).rejects.toBeInstanceOf(NotFoundError);

        connExecute
            .mockResolvedValueOnce([
                [{ cid: 10, base_price: "100", quantity: 5, is_active: 1 }],
                [],
            ])
            .mockResolvedValueOnce([[], []]);
        await expect(
            orderDAO.createOrderWithItems({
                order: { user_id: null, guest_email: "g@test.com" },
                addresses: [shippingAddress],
                items: [{ cid: 10, config_id: 88, quantity: 1 }],
                taxRate: 0.13,
            }),
        ).rejects.toMatchObject({ message: "Configuration not found" });
    });

    test("restoreStockForItems and restoreCartItems run transactions", async () => {
        connExecute.mockResolvedValue([{ affectedRows: 1 }, []]);
        await orderDAO.restoreStockForItems([
            { cid: 1, quantity: 2 },
            { cid: 1, quantity: 1 },
        ]);
        expect(connExecute).toHaveBeenCalled();

        jest.clearAllMocks();
        connExecute.mockResolvedValue([{ affectedRows: 1 }, []]);
        await orderDAO.restoreCartItems(5, [
            { cid: 1, config_id: null, quantity: 2 },
            { cid: 2, config_id: 9, quantity: 1 },
        ]);
        expect(connExecute).toHaveBeenCalledTimes(2);
    });
});
