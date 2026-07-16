import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
    DatabaseError,
} from "../../../utils/errors.js";

const { execute, connExecute, getPool } = createMockPool();
await mockDbModule(getPool);

const cartDAO = (await import("../../../services/cart/cartDAO.js")).default;

describe("cartDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("findCartByUserId returns row or null", async () => {
        execute.mockResolvedValueOnce([[{ cart_id: 3, user_id: 1 }], []]);
        await expect(cartDAO.findCartByUserId(1)).resolves.toEqual({
            cart_id: 3,
            user_id: 1,
        });

        execute.mockResolvedValueOnce([[], []]);
        await expect(cartDAO.findCartByUserId(99)).resolves.toBeNull();
    });

    test("findOptionsByConfigIds short-circuits empty input", async () => {
        await expect(cartDAO.findOptionsByConfigIds([])).resolves.toEqual([]);
        expect(execute).not.toHaveBeenCalled();
    });

    test("findItemsByCartId rejects unsupported sort", async () => {
        await expect(
            cartDAO.findItemsByCartId(1, 10, 0, "bad_sort"),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("ensureCartForUser returns existing cart", async () => {
        execute.mockResolvedValueOnce([[{ cart_id: 7 }], []]);
        await expect(cartDAO.ensureCartForUser(5)).resolves.toBe(7);
    });

    test("ensureCartForUser recovers from insert conflict", async () => {
        execute
            .mockResolvedValueOnce([[], []])
            .mockRejectedValueOnce({ code: "ER_DUP_ENTRY", message: "dup" })
            .mockResolvedValueOnce([[{ cart_id: 12 }], []]);

        await expect(cartDAO.ensureCartForUser(5)).resolves.toBe(12);
    });

    test("ensureCartForUser throws when conflict leaves no cart", async () => {
        execute
            .mockResolvedValueOnce([[], []])
            .mockRejectedValueOnce({ code: "ER_DUP_ENTRY", message: "dup" })
            .mockResolvedValueOnce([[], []]);

        await expect(cartDAO.ensureCartForUser(5)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("findActiveGuestCartBySessionToken deletes expired carts", async () => {
        const past = new Date(Date.now() - 60_000).toISOString();
        execute
            .mockResolvedValueOnce([
                [{ cart_id: 4, session_token: "tok", expires_at: past }],
                [],
            ])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await expect(
            cartDAO.findActiveGuestCartBySessionToken("tok"),
        ).resolves.toBeNull();
        expect(execute).toHaveBeenCalledTimes(2);
    });

    test("findActiveGuestCartBySessionToken returns active cart", async () => {
        const future = new Date(Date.now() + 86_400_000).toISOString();
        execute.mockResolvedValueOnce([
            [{ cart_id: 4, session_token: "tok", expires_at: future }],
            [],
        ]);

        const cart = await cartDAO.findActiveGuestCartBySessionToken("tok");
        expect(cart.cart_id).toBe(4);
    });

    test("deleteItemById throws when row missing", async () => {
        execute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
        await expect(cartDAO.deleteItemById(999)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("insertCart maps duplicate key to ConflictError", async () => {
        execute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });

        await expect(cartDAO.insertCart(1)).rejects.toBeInstanceOf(
            ConflictError,
        );
    });

    test("upsertCartItemIncrement rejects over max quantity", async () => {
        connExecute
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ cart_item_id: 1, quantity: 98 }], []]);

        await expect(
            cartDAO.upsertCartItemIncrement({
                cart_id: 1,
                cid: 10,
                quantity: 2,
                maxQuantity: 99,
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("upsertCartItemIncrement rejects inactive catalog", async () => {
        connExecute
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ cart_item_id: 1, quantity: 0 }], []])
            .mockResolvedValueOnce([[{ quantity: 5, is_active: 0 }], []]);

        await expect(
            cartDAO.upsertCartItemIncrement({
                cart_id: 1,
                cid: 10,
                quantity: 1,
                maxQuantity: 99,
            }),
        ).rejects.toMatchObject({ message: "Catalog item is not available." });
    });

    test("upsertCartItemIncrement rejects out of stock with zero stock message", async () => {
        connExecute
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ cart_item_id: 1, quantity: 0 }], []])
            .mockResolvedValueOnce([[{ quantity: 0, is_active: 1 }], []]);

        await expect(
            cartDAO.upsertCartItemIncrement({
                cart_id: 1,
                cid: 10,
                quantity: 1,
                maxQuantity: 99,
            }),
        ).rejects.toMatchObject({ message: "Catalog item is out of stock." });
    });

    test("upsertCartItemIncrement rejects partial stock", async () => {
        connExecute
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ cart_item_id: 1, quantity: 0 }], []])
            .mockResolvedValueOnce([[{ quantity: 2, is_active: 1 }], []]);

        await expect(
            cartDAO.upsertCartItemIncrement({
                cart_id: 1,
                cid: 10,
                quantity: 3,
                maxQuantity: 99,
            }),
        ).rejects.toMatchObject({ message: "Only 2 unit(s) available in stock." });
    });

    test("upsertCartItemIncrement succeeds with config_id branch", async () => {
        connExecute
            .mockResolvedValueOnce([[], []])
            .mockResolvedValueOnce([[{ cart_item_id: 1, quantity: 1 }], []])
            .mockResolvedValueOnce([[{ quantity: 10, is_active: 1 }], []])
            .mockResolvedValueOnce([{ insertId: 55, affectedRows: 1 }, []]);

        await expect(
            cartDAO.upsertCartItemIncrement({
                cart_id: 1,
                cid: 10,
                config_id: 20,
                quantity: 1,
                maxQuantity: 99,
            }),
        ).resolves.toBe(55);
    });

    test("updateItemQuantity throws when cart item missing", async () => {
        connExecute.mockResolvedValueOnce([[], []]);

        await expect(
            cartDAO.updateItemQuantity(1, 999, 1),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("mergeGuestCartIntoUser returns false when guest missing", async () => {
        connExecute.mockResolvedValueOnce([[], []]);

        await expect(
            cartDAO.mergeGuestCartIntoUser({
                userId: 1,
                sessionToken: "missing",
                maxQuantity: 99,
                validateLine: jest.fn(),
            }),
        ).resolves.toEqual({ merged: false, moved_items: 0 });
    });

    test("mergeGuestCartIntoUser deletes expired guest cart", async () => {
        const past = new Date(Date.now() - 60_000).toISOString();
        connExecute
            .mockResolvedValueOnce([
                [{ cart_id: 2, expires_at: past, session_token: "tok" }],
                [],
            ])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await expect(
            cartDAO.mergeGuestCartIntoUser({
                userId: 1,
                sessionToken: "tok",
                maxQuantity: 99,
                validateLine: jest.fn(),
            }),
        ).resolves.toEqual({ merged: false, moved_items: 0 });
    });

    test("mergeGuestCartIntoUser maps generic transaction errors to DatabaseError", async () => {
        connExecute.mockRejectedValueOnce(new Error("connection lost"));

        await expect(
            cartDAO.mergeGuestCartIntoUser({
                userId: 1,
                sessionToken: "tok",
                maxQuantity: 99,
                validateLine: jest.fn(),
            }),
        ).rejects.toBeInstanceOf(DatabaseError);
    });
});
