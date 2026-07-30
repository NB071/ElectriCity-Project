import { jest } from "@jest/globals";
import { ValidationError } from "../../../utils/errors.js";

const mockFindById = jest.fn();
const mockFindPrimaryByCid = jest.fn();
const mockFindImagesByCids = jest.fn();
const mockCountAllMedia = jest.fn();
const mockFindAllMedia = jest.fn();
const mockResolve = jest.fn();
const mockGetStrategy = jest.fn(() => ({ resolve: mockResolve }));

await jest.unstable_mockModule("../../../services/media/mediaDAO.js", () => ({
    default: {
        findById: mockFindById,
        findPrimaryByCid: mockFindPrimaryByCid,
        findImagesByCids: mockFindImagesByCids,
        countAllMedia: mockCountAllMedia,
        findAllMedia: mockFindAllMedia,
    },
}));

await jest.unstable_mockModule(
    "../../../services/media/strategies/index.js",
    () => ({
        default: mockGetStrategy,
    }),
);

const {
    resolveMediaById,
    resolveMediaByCid,
    resolvePrimaryCatalogImage,
    resolvePreviewImagesByCids,
    viewAllMedia,
} = await import("../../../services/media/mediaQuery.js");

describe("mediaQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetStrategy.mockImplementation(() => ({ resolve: mockResolve }));
    });

    test("resolveMediaById returns DAO row", async () => {
        mockFindById.mockResolvedValue({ media_id: 1 });
        await expect(resolveMediaById(1)).resolves.toEqual({ media_id: 1 });
    });

    test("resolveMediaByCid uses strategy when mediaType set", async () => {
        mockResolve.mockResolvedValue([{ media_id: 2 }]);
        await expect(resolveMediaByCid(9, "image")).resolves.toEqual([
            { media_id: 2 },
        ]);
        expect(mockGetStrategy).toHaveBeenCalledWith("image");
    });

    test("resolveMediaByCid groups all strategies when type omitted", async () => {
        mockResolve
            .mockResolvedValueOnce([{ media_id: 1 }])
            .mockResolvedValueOnce([{ media_id: 2 }]);

        await expect(resolveMediaByCid(9)).resolves.toEqual({
            images: [{ media_id: 1 }],
            pdfs: [{ media_id: 2 }],
        });
    });

    test("resolvePrimaryCatalogImage and preview helpers delegate", async () => {
        mockFindPrimaryByCid.mockResolvedValue({ media_id: 3 });
        mockFindImagesByCids.mockResolvedValue(new Map());

        await expect(resolvePrimaryCatalogImage(4)).resolves.toEqual({
            media_id: 3,
        });
        await resolvePreviewImagesByCids([1, 2]);
        expect(mockFindImagesByCids).toHaveBeenCalledWith([1, 2], {
            limitPerCid: 5,
        });
    });

    test("viewAllMedia rejects invalid pagination", async () => {
        await expect(viewAllMedia({ page: 0 })).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(mockCountAllMedia).not.toHaveBeenCalled();
    });

    test("viewAllMedia returns empty list when total is 0", async () => {
        mockCountAllMedia.mockResolvedValue(0);

        const result = await viewAllMedia();
        expect(result.items).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(mockFindAllMedia).not.toHaveBeenCalled();
    });

    test("viewAllMedia maps rows when total is positive", async () => {
        mockCountAllMedia.mockResolvedValue(1);
        mockFindAllMedia.mockResolvedValue([
            {
                media_id: 10,
                url: "https://cdn/a.jpg",
                file_type: "image/jpeg",
                alt_text: "Alt",
                uploaded_at: "2025-01-01",
                cid: 5,
                is_primary: 1,
            },
        ]);

        const result = await viewAllMedia({ page: 1, limit: 10 });
        expect(result.items[0]).toMatchObject({
            media_id: 10,
            linked_cid: 5,
            is_primary: true,
        });
        expect(mockFindAllMedia).toHaveBeenCalledWith(10, 0);
    });

    test("viewAllMedia propagates DAO errors", async () => {
        mockCountAllMedia.mockRejectedValue(new Error("count failed"));

        await expect(viewAllMedia({ page: 1 })).rejects.toThrow("count failed");
    });
});
