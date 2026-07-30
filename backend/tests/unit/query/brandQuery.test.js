import { jest } from "@jest/globals";
import { ValidationError, NotFoundError } from "../../../utils/errors.js";

const mockCountBrands = jest.fn();
const mockFindLiteBrands = jest.fn();
const mockFindBrands = jest.fn();
const mockFindById = jest.fn();
const mockFindModelsByBrandId = jest.fn();

await jest.unstable_mockModule(
    "../../../services/catalog/_brand/brandDAO.js",
    () => ({
        default: {
            countBrands: mockCountBrands,
            findLiteBrands: mockFindLiteBrands,
            findBrands: mockFindBrands,
            findById: mockFindById,
            findModelsByBrandId: mockFindModelsByBrandId,
        },
    }),
);

const { listBrands, getBrandById, listBrandModels } = await import(
    "../../../services/catalog/_brand/brandQuery.js"
);

const brandRow = {
    brand_id: 1,
    name: "Tesla",
    description: "EV maker",
    country: "US",
    website_url: "https://tesla.com",
    media_id: 10,
    is_featured: 1,
    display_order: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-02",
    logo_url: "https://cdn/logo.png",
    logo_file_type: "image/png",
    logo_alt_text: "Tesla logo",
};

describe("brandQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("listBrands lite mode maps lite DTOs", async () => {
        mockFindLiteBrands.mockResolvedValue([
            { brand_id: 1, name: "Tesla" },
            { brand_id: 2, name: "Nissan" },
        ]);

        const result = await listBrands({ lite: "true", is_featured: "1" });

        expect(result.items).toEqual([
            { id: 1, name: "Tesla" },
            { id: 2, name: "Nissan" },
        ]);
        expect(result.pagination).toBeUndefined();
        expect(mockFindLiteBrands).toHaveBeenCalledWith({ is_featured: true });
        expect(mockCountBrands).not.toHaveBeenCalled();
    });

    test("listBrands featured mode returns list items without pagination", async () => {
        mockFindBrands.mockResolvedValue([brandRow]);

        const result = await listBrands({ is_featured: "yes" });

        expect(result.items[0].id).toBe(1);
        expect(result.items[0].is_featured).toBe(true);
        expect(mockFindBrands).toHaveBeenCalledWith(
            { is_featured: true },
            { orderByDisplayOrder: false },
        );
    });

    test("listBrands paginated mode returns pagination meta", async () => {
        mockCountBrands.mockResolvedValue(25);
        mockFindBrands.mockResolvedValue([brandRow]);

        const result = await listBrands({ page: "2", limit: "10" });

        expect(result.items).toHaveLength(1);
        expect(result.pagination).toEqual({
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
        });
        expect(mockFindBrands).toHaveBeenCalledWith(
            {},
            { orderByDisplayOrder: true, limit: 10, offset: 10 },
        );
    });

    test("listBrands rejects invalid pagination", async () => {
        await expect(listBrands({ page: "0" })).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(mockCountBrands).not.toHaveBeenCalled();
    });

    test("getBrandById returns detail DTO", async () => {
        mockFindById.mockResolvedValue(brandRow);

        const detail = await getBrandById("1");

        expect(detail.id).toBe(1);
        expect(detail.description).toBe("EV maker");
        expect(mockFindById).toHaveBeenCalledWith(1);
    });

    test("getBrandById rejects invalid id", async () => {
        await expect(getBrandById("abc")).rejects.toBeInstanceOf(
            ValidationError,
        );
        expect(mockFindById).not.toHaveBeenCalled();
    });

    test("listBrandModels verifies brand and maps models", async () => {
        mockFindById.mockResolvedValue(brandRow);
        mockFindModelsByBrandId.mockResolvedValue([
            { model_id: 10, name: "Model 3", release_year: "2024" },
        ]);

        const result = await listBrandModels(1);

        expect(result.items).toEqual([
            { id: 10, name: "Model 3", release_year: 2024 },
        ]);
        expect(mockFindById).toHaveBeenCalledWith(1);
        expect(mockFindModelsByBrandId).toHaveBeenCalledWith(1);
    });

    test("listBrandModels propagates not found from findById", async () => {
        mockFindById.mockRejectedValue(new NotFoundError("Brand"));

        await expect(listBrandModels(99)).rejects.toBeInstanceOf(NotFoundError);
        expect(mockFindModelsByBrandId).not.toHaveBeenCalled();
    });
});
