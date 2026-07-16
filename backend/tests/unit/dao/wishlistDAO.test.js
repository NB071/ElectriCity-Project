import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import {
    ValidationError,
    DatabaseError,
    NotFoundError,
    ConflictError,
} from "../../../utils/errors.js";
import { VALIDATIONS } from "../../../services/wishlist/constants.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const wishlistDAO = (await import("../../../services/wishlist/wishlistDAO.js"))
    .default;

describe("wishlistDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(VALIDATIONS.SORT_VALUES)(
        "findByUserId accepts sort %s",
        async (sort) => {
            execute.mockResolvedValueOnce([
                [
                    {
                        user_id: 1,
                        cid: 2,
                        brand_name: "Tesla",
                        model_name: "Model 3",
                        base_price: "45000",
                    },
                ],
                [],
            ]);

            const rows = await wishlistDAO.findByUserId(1, 10, 0, sort);
            expect(rows).toHaveLength(1);
            expect(execute.mock.calls[0][0]).toContain("ORDER BY");
        },
    );

    test("findByUserId rejects unsupported sort", async () => {
        await expect(
            wishlistDAO.findByUserId(1, 10, 0, "not_a_sort"),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("countByUserId returns total", async () => {
        execute.mockResolvedValueOnce([[{ total: 4 }], []]);
        await expect(wishlistDAO.countByUserId(1)).resolves.toBe(4);
    });

    test("findEntry throws when missing", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await expect(wishlistDAO.findEntry(1, 99)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("insert returns retrieved entry", async () => {
        execute
            .mockResolvedValueOnce([{ insertId: 0, affectedRows: 1 }, []])
            .mockResolvedValueOnce([
                [{ user_id: 1, cid: 2, added_at: "2025-01-01" }],
                [],
            ]);

        const entry = await wishlistDAO.insert({ user_id: 1, cid: 2 });
        expect(entry).toEqual({
            user_id: 1,
            cid: 2,
            added_at: "2025-01-01",
        });
    });

    test("insert throws DatabaseError when entry cannot be re-read", async () => {
        // Non-empty result avoids NotFoundError in findEntry, but rows[0] is falsy (empty array)
        execute
            .mockResolvedValueOnce([{ insertId: 0, affectedRows: 1 }, []])
            .mockResolvedValueOnce([[null], []]);

        await expect(
            wishlistDAO.insert({ user_id: 1, cid: 2 }),
        ).rejects.toBeInstanceOf(DatabaseError);
    });

    test("insert maps duplicate key to ConflictError", async () => {
        execute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });

        await expect(
            wishlistDAO.insert({ user_id: 1, cid: 2 }),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("deleteByUserAndCid throws when missing", async () => {
        execute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
        await expect(
            wishlistDAO.deleteByUserAndCid(1, 99),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
