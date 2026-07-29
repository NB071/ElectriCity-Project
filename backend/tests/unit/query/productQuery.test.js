import { jest } from "@jest/globals";
import { ValidationError, NotFoundError, DatabaseError } from "../../../utils/errors.js";

const mockCountVehicles = jest.fn();
const mockFindVehicles = jest.fn();
const mockFindBaseById = jest.fn();
const mockExistsById = jest.fn();
const mockFindManyForCompare = jest.fn();
const mockGetPreviewImagesByCids = jest.fn();
const mockGetPromotionsForItems = jest.fn();
const mockGetForItem = jest.fn();
const mockGetEquippedForItem = jest.fn();

await jest.unstable_mockModule(
    "../../../services/catalog/_product/productDAO.js",
    () => ({
        default: {
            countVehicles: mockCountVehicles,
            findVehicles: mockFindVehicles,
            findBaseById: mockFindBaseById,
            existsById: mockExistsById,
            findManyForCompare: mockFindManyForCompare,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/catalog/MediaAdapter.js",
    () => ({
        default: {
            getPrimaryImage: jest.fn(),
            getItemImages: jest.fn(),
            getPreviewImagesByCids: mockGetPreviewImagesByCids,
            getVehicleHistoryReport: jest.fn(),
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/catalog/_promotions/promotionsQuery.js",
    () => ({
        getPromotionsForItems: mockGetPromotionsForItems,
        getPromotionsForItem: jest.fn().mockResolvedValue([]),
    }),
);

await jest.unstable_mockModule(
    "../../../services/catalog/_options/optionsQuery.js",
    () => ({
        getForItem: mockGetForItem,
        getEquippedForItem: mockGetEquippedForItem,
        groupOptionsByCategory: jest.fn((rows) => rows),
    }),
);

const {
    browseVehicles,
    searchVehicles,
    getCatalogItemDetails,
    compareCatalogItems,
    ensureCatalogItemExists,
} = await import("../../../services/catalog/_product/productQuery.js");

const listRow = {
    cid: 1,
    item_type: "vehicle",
    base_price: "45000",
    quantity: 2,
    is_active: 1,
    created_at: "2025-01-01",
    model_id: 1,
    model_name: "Model 3",
    brand_id: 1,
    brand_name: "Tesla",
    year: 2024,
    condition: "new",
    mileage: 0,
    body_shape: "sedan",
    door_count: 4,
    drivetrain: "AWD",
};

describe("productQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPromotionsForItems.mockResolvedValue(new Map([[1, []]]));
        mockCountVehicles.mockResolvedValue(1);
        mockFindVehicles.mockResolvedValue([listRow]);
        mockGetPreviewImagesByCids.mockResolvedValue(
            new Map([
                [
                    1,
                    [
                        {
                            media_id: 1,
                            url: "https://cdn/a.jpg",
                            is_primary: 1,
                            display_order: 0,
                        },
                        {
                            media_id: 2,
                            url: "https://cdn/b.jpg",
                            is_primary: 0,
                            display_order: 1,
                        },
                    ],
                ],
            ]),
        );
    });

    test("browseVehicles / searchVehicles reject bad pagination", async () => {
        await expect(browseVehicles({ page: 0 })).rejects.toBeInstanceOf(
            ValidationError,
        );
        await expect(searchVehicles({ page: 0, q: "tesla" })).rejects.toBeInstanceOf(
            ValidationError,
        );
    });

    test("browseVehicles includes up to 5 preview image urls", async () => {
        const result = await browseVehicles({ page: 1, limit: 10 });
        expect(result.items[0].primary_image_url).toBe("https://cdn/a.jpg");
        expect(result.items[0].image_urls).toEqual([
            "https://cdn/a.jpg",
            "https://cdn/b.jpg",
        ]);
        expect(mockGetPreviewImagesByCids).toHaveBeenCalledWith([1], 5);
    });

    test("browseVehicles handles vehicles with no images", async () => {
        mockGetPreviewImagesByCids.mockResolvedValue(new Map());
        const result = await browseVehicles({ page: 1, limit: 10 });
        expect(result.items).toHaveLength(1);
        expect(result.items[0].primary_image_url).toBeNull();
        expect(result.items[0].image_urls).toEqual([]);
    });

    test("browseVehicles rethrows DatabaseError from preview images", async () => {
        mockGetPreviewImagesByCids.mockRejectedValue(new DatabaseError("cdn down"));
        await expect(browseVehicles({ page: 1, limit: 10 })).rejects.toBeInstanceOf(
            DatabaseError,
        );
    });

    test("searchVehicles returns q and items", async () => {
        const result = await searchVehicles({ q: "Tesla", page: 1, limit: 10 });
        expect(result.q).toBe("Tesla");
        expect(result.items).toHaveLength(1);
    });

    test("getCatalogItemDetails throws when base missing", async () => {
        mockFindBaseById.mockResolvedValue(null);
        await expect(getCatalogItemDetails(1)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });

    test("compareCatalogItems throws when some cids missing", async () => {
        mockFindManyForCompare.mockResolvedValue([listRow]);
        await expect(
            compareCatalogItems({ cids: "1,2" }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("ensureCatalogItemExists throws when missing", async () => {
        mockExistsById.mockResolvedValue(false);
        await expect(ensureCatalogItemExists(1)).rejects.toBeInstanceOf(
            NotFoundError,
        );

        mockExistsById.mockResolvedValue(true);
        await expect(
            ensureCatalogItemExists(1, { requireActive: true }),
        ).resolves.toBeUndefined();
        expect(mockExistsById).toHaveBeenCalledWith(1, { requireActive: true });
    });
});
