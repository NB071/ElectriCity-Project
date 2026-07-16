import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import { ValidationError } from "../../../utils/errors.js";

const { execute, getPool } = createMockPool();
await mockDbModule(getPool);

const accountDAO = (
    await import("../../../services/iam/_identity/accountDAO.js")
).default;

describe("accountDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("findById rejects unsupported fields", async () => {
        await expect(
            accountDAO.findById(1, ["not_a_field"]),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("searchUsers active keyword filters deleted_at IS NULL", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await accountDAO.searchUsers("active", 10, 0);
        expect(execute.mock.calls[0][0]).toContain("u.deleted_at IS NULL");
        expect(execute.mock.calls[0][1]).toEqual([]);
    });

    test("searchUsers deleted keyword filters deleted_at IS NOT NULL", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await accountDAO.searchUsers("deleted", 10, 0);
        expect(execute.mock.calls[0][0]).toContain("u.deleted_at IS NOT NULL");
    });

    test("updateById no-ops when no allowed columns", async () => {
        await accountDAO.updateById(1, { role: "admin", ignored: true });
        expect(execute).not.toHaveBeenCalled();
    });

    test("updateById updates allowed columns", async () => {
        execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
        await accountDAO.updateById(1, {
            first_name: "Ada",
            bogus: "x",
        });
        expect(execute.mock.calls[0][0]).toContain("first_name = ?");
        expect(execute.mock.calls[0][1]).toEqual(["Ada", 1]);
    });

    test("emailExists uses excludeUserId branch", async () => {
        execute.mockResolvedValueOnce([[{ found: 1 }], []]);
        await expect(accountDAO.emailExists("a@test.com", 5)).resolves.toBe(
            true,
        );
        expect(execute.mock.calls[0][1]).toEqual(["a@test.com", 5]);
    });
});
