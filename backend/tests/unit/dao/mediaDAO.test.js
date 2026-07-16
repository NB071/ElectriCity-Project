import { jest } from "@jest/globals";
import { createMockPool, mockDbModule } from "../helpers/mockPool.js";
import {
    NotFoundError,
    ConflictError,
    DatabaseError,
} from "../../../utils/errors.js";

const { execute, connExecute, getPool } = createMockPool();
await mockDbModule(getPool);

const mediaDAO = (await import("../../../services/media/mediaDAO.js")).default;

describe("mediaDAO", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("findById returns row or throws NotFoundError", async () => {
        execute.mockResolvedValueOnce([
            [{ media_id: 1, url: "https://cdn/a.jpg", file_type: "image/jpeg" }],
            [],
        ]);
        await expect(mediaDAO.findById(1)).resolves.toMatchObject({
            media_id: 1,
        });

        execute.mockResolvedValueOnce([[], []]);
        await expect(mediaDAO.findById(404)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("findByCid returns rows or throws when none linked", async () => {
        execute.mockResolvedValueOnce([
            [{ media_id: 1, display_order: 0, is_primary: 1 }],
            [],
        ]);
        await expect(mediaDAO.findByCid(10)).resolves.toHaveLength(1);

        execute.mockResolvedValueOnce([[], []]);
        await expect(mediaDAO.findByCid(10)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("findByCidAndType returns empty without throwing", async () => {
        execute.mockResolvedValueOnce([[], []]);
        await expect(
            mediaDAO.findByCidAndType(10, "image/png"),
        ).resolves.toEqual([]);
    });

    test("insertMedia and linkToCatalogItem map duplicates to ConflictError", async () => {
        execute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });
        await expect(
            mediaDAO.insertMedia({ url: "https://cdn/a.jpg" }),
        ).rejects.toBeInstanceOf(ConflictError);

        execute.mockRejectedValueOnce({
            code: "ER_DUP_ENTRY",
            message: "dup",
        });
        await expect(
            mediaDAO.linkToCatalogItem({ cid: 1, media_id: 2 }),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("linkToCatalogItem coerces is_primary boolean", async () => {
        execute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
        await mediaDAO.linkToCatalogItem({
            cid: 1,
            media_id: 2,
            display_order: 3,
            is_primary: true,
        });
        expect(execute.mock.calls[0][1]).toEqual([1, 2, 3, 1]);
    });

    test("unlinkFromCatalogItem and deleteMediaById throw when missing", async () => {
        execute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
        await expect(
            mediaDAO.unlinkFromCatalogItem(1, 2),
        ).rejects.toBeInstanceOf(NotFoundError);

        execute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
        await expect(mediaDAO.deleteMediaById(99)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("setPrimaryCatalogImage throws when image link missing", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockResolvedValueOnce([{ affectedRows: 0 }, []]);

        await expect(
            mediaDAO.setPrimaryCatalogImage(1, 99),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("setPrimaryCatalogImage maps duplicate primary to ConflictError", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockRejectedValueOnce({ code: "ER_DUP_ENTRY", message: "dup" });

        await expect(
            mediaDAO.setPrimaryCatalogImage(1, 2),
        ).rejects.toBeInstanceOf(ConflictError);
    });

    test("setPrimaryCatalogImage rethrows unexpected errors as DatabaseError", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 1 }, []])
            .mockRejectedValueOnce(new Error("connection lost"));

        await expect(
            mediaDAO.setPrimaryCatalogImage(1, 2),
        ).rejects.toBeInstanceOf(DatabaseError);
    });

    test("setPrimaryCatalogImage succeeds", async () => {
        connExecute
            .mockResolvedValueOnce([{ affectedRows: 2 }, []])
            .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

        await expect(
            mediaDAO.setPrimaryCatalogImage(1, 2),
        ).resolves.toBeUndefined();
    });
});
