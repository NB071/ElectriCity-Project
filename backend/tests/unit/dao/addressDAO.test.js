import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import { NotFoundError } from "../../../utils/errors.js";

const { execute, connExecute, getPool } = createMockPool();
await mockDbModule(getPool);

const addressDAO = (
    await import("../../../services/iam/_identity/addressDAO.js")
).default;

describe("addressDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("updateById no-ops when no allowed columns", async () => {
        await addressDAO.updateById(1, 2, { unknown: "x" });
        expect(execute).not.toHaveBeenCalled();
        expect(connExecute).not.toHaveBeenCalled();
    });

    test("updateById clears previous default when setting is_default", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await addressDAO.updateById(9, 2, {
            street: "2 Queen",
            is_default: true,
        });

        expect(connExecute.mock.calls[0][0]).toContain(
            "SET is_default = FALSE",
        );
        expect(connExecute.mock.calls[1][0]).toContain("UPDATE addresses");
    });

    test("updateById throws when address missing", async () => {
        connExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
        await expect(
            addressDAO.updateById(9, 2, { city: "Ottawa" }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("setDefault throws when address missing", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 0 }, []]);

        await expect(addressDAO.setDefault(9, 2)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("insert clears defaults when is_default true", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ insertId: 15, affectedRows: 1 }, []])
            .mockResolvedValueOnce([
                [
                    {
                        address_id: 15,
                        user_id: 2,
                        street: "1 Main",
                        city: "Toronto",
                        province: "ON",
                        country: "Canada",
                        postal_code: "M5H2N2",
                        is_default: 1,
                    },
                ],
                [],
            ]);

        const row = await addressDAO.insert({
            user_id: 2,
            street: "1 Main",
            city: "Toronto",
            province: "ON",
            country: "Canada",
            postal_code: "M5H2N2",
            is_default: true,
        });
        expect(row.address_id).toBe(15);
        expect(connExecute.mock.calls[0][0]).toContain(
            "SET is_default = FALSE",
        );
    });
});
