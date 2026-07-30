import { jest } from "@jest/globals";

const mockFindCidsByUserId = jest.fn();
const mockCountByUserId = jest.fn();
const mockFindByUserId = jest.fn();
const mockFindEntry = jest.fn();

await jest.unstable_mockModule(
    "../../../services/wishlist/wishlistDAO.js",
    () => ({
        default: {
            findCidsByUserId: mockFindCidsByUserId,
            countByUserId: mockCountByUserId,
            findByUserId: mockFindByUserId,
            findEntry: mockFindEntry,
        },
    }),
);

const { listWishlistIds, viewWishlist, isInWishlist } = await import(
    "../../../services/wishlist/wishlistQuery.js"
);
const { ValidationError } = await import("../../../utils/errors.js");

const wishlistRow = {
    cid: 3,
    added_at: "2025-01-01",
    item_type: "vehicle",
    brand_name: "Tesla",
    model_name: "Model 3",
    base_price: "40000",
    quantity: 1,
    is_active: 1,
    primary_image_url: "https://cdn/a.jpg",
};

describe("wishlistQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("listWishlistIds maps cids for user", async () => {
        mockFindCidsByUserId.mockResolvedValue([{ cid: 1 }, { cid: "2" }]);

        await expect(listWishlistIds("7")).resolves.toEqual({
            cids: [1, 2],
        });
        expect(mockFindCidsByUserId).toHaveBeenCalledWith(7);
    });

    test("listWishlistIds rejects invalid user id", async () => {
        await expect(listWishlistIds(0)).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(mockFindCidsByUserId).not.toHaveBeenCalled();
    });

    test("listWishlistIds propagates DAO errors", async () => {
        mockFindCidsByUserId.mockRejectedValue(new Error("ids failed"));

        await expect(listWishlistIds(1)).rejects.toThrow("ids failed");
    });

    test("viewWishlist skips find when total is 0", async () => {
        mockCountByUserId.mockResolvedValue(0);

        const result = await viewWishlist(1);

        expect(result.items).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(result.sort).toBeDefined();
        expect(mockFindByUserId).not.toHaveBeenCalled();
    });

    test("viewWishlist maps rows when total is positive", async () => {
        mockCountByUserId.mockResolvedValue(1);
        mockFindByUserId.mockResolvedValue([wishlistRow]);

        const result = await viewWishlist(1, {
            page: 1,
            limit: 10,
            sort: "added_at_desc",
        });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].cid).toBe(3);
        expect(result.items[0].catalog_item.name).toBe("Tesla Model 3");
        expect(mockFindByUserId).toHaveBeenCalledWith(
            1,
            10,
            0,
            "added_at_desc",
        );
    });

    test("viewWishlist rejects invalid pagination", async () => {
        await expect(
            viewWishlist(1, { page: -1 }),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(mockCountByUserId).not.toHaveBeenCalled();
    });

    test("viewWishlist propagates DAO errors", async () => {
        mockCountByUserId.mockRejectedValue(new Error("count failed"));

        await expect(viewWishlist(1, {})).rejects.toThrow("count failed");
    });

    test("isInWishlist maps entry DTO", async () => {
        mockFindEntry.mockResolvedValue({
            user_id: 1,
            cid: 3,
            added_at: "2025-01-01",
        });

        await expect(isInWishlist(1, 3)).resolves.toEqual({
            user_id: 1,
            cid: 3,
            added_at: "2025-01-01",
        });
        expect(mockFindEntry).toHaveBeenCalledWith(1, 3);
    });

    test("isInWishlist propagates DAO errors", async () => {
        mockFindEntry.mockRejectedValue(new Error("entry failed"));

        await expect(isInWishlist(1, 3)).rejects.toThrow("entry failed");
    });
});
