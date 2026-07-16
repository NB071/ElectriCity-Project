import { jest } from "@jest/globals";

const mockSearchVehicles = jest.fn();

await jest.unstable_mockModule(
    "../../../services/catalog/catalog.service.js",
    () => ({
        default: {
            searchVehicles: mockSearchVehicles,
        },
    }),
);

const {
    resolveVehicleReference,
    toMatchSummary,
} = await import(
    "../../../services/chatbot/strategies/helpers/resolveVehicleReference.js"
);

const item = ({
    id = 1,
    name = "Tesla Model 3",
    brand = "Tesla",
    model = "Model 3",
    condition = "new",
    year = 2024,
} = {}) => ({
    id,
    name,
    base_price: 45000,
    brand: brand ? { name: brand } : undefined,
    model: model ? { name: model } : undefined,
    vehicle: { condition, year },
});

describe("resolveVehicleReference", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("toMatchSummary null-coalesces optional nested fields", () => {
        expect(
            toMatchSummary({
                id: 9,
                name: "Unknown",
                base_price: 1,
            }),
        ).toEqual({
            cid: 9,
            name: "Unknown",
            brand: null,
            model: null,
            condition: null,
            year: null,
            base_price: 1,
        });
    });

    test("returns cid immediately when provided", async () => {
        await expect(resolveVehicleReference({ cid: 42 })).resolves.toEqual({
            cid: 42,
        });
        expect(mockSearchVehicles).not.toHaveBeenCalled();
    });

    test("returns validation error when model_name missing", async () => {
        await expect(resolveVehicleReference({})).resolves.toMatchObject({
            error: { code: "VALIDATION_ERROR" },
        });
        await expect(
            resolveVehicleReference({ model_name: "   " }),
        ).resolves.toMatchObject({
            error: { code: "VALIDATION_ERROR" },
        });
    });

    test("returns NOT_FOUND when search has no matches", async () => {
        mockSearchVehicles.mockResolvedValue({ items: [] });

        await expect(
            resolveVehicleReference({ model_name: "DoesNotExist" }),
        ).resolves.toMatchObject({
            error: { code: "NOT_FOUND" },
        });
    });

    test("returns single cid when exactly one match", async () => {
        mockSearchVehicles.mockResolvedValue({
            items: [item({ id: 7, name: "Nissan Leaf", brand: "Nissan", model: "Leaf" })],
        });

        await expect(
            resolveVehicleReference({
                model_name: "Leaf",
                brand_name: "Nissan",
                condition: "used",
                year: 2020,
            }),
        ).resolves.toEqual({ cid: 7 });

        expect(mockSearchVehicles).toHaveBeenCalledWith(
            expect.objectContaining({
                q: "Nissan Leaf",
                condition: "used",
                year_min: 2020,
                year_max: 2020,
            }),
        );
    });

    test("returns ambiguous matches when multiple remain after filter", async () => {
        mockSearchVehicles.mockResolvedValue({
            items: [
                item({ id: 1, name: "Tesla Model 3", model: "Model 3" }),
                item({
                    id: 2,
                    name: "Tesla Model 3 Long Range",
                    model: "Model 3 Long Range",
                }),
                item({
                    id: 3,
                    name: "Other Brand X",
                    brand: "Other",
                    model: "X",
                }),
            ],
        });

        const result = await resolveVehicleReference({
            model_name: "Model 3",
            brand_name: "Tesla",
        });

        expect(result.ambiguous).toBe(true);
        expect(result.matches).toHaveLength(2);
        expect(result.matches[0].cid).toBe(1);
        expect(result.matches[0].brand).toBe("Tesla");
    });

    test("filterMatches treats missing brand filter as match-all", async () => {
        mockSearchVehicles.mockResolvedValue({
            items: [
                item({ id: 1, name: "Tesla Model Y", model: "Model Y" }),
            ],
        });

        await expect(
            resolveVehicleReference({ model_name: "Model Y" }),
        ).resolves.toEqual({ cid: 1 });
    });
});
