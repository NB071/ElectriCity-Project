import { jest } from "@jest/globals";
import { NotFoundError, DatabaseError } from "../../../utils/errors.js";

const mockGetPromotionsForItem = jest.fn();
const mockGetCatalogReviewSummary = jest.fn();

await jest.unstable_mockModule(
    "../../../services/catalog/_promotions/promotionsQuery.js",
    () => ({
        getPromotionsForItem: mockGetPromotionsForItem,
    }),
);

await jest.unstable_mockModule(
    "../../../services/review/reviewQuery.js",
    () => ({
        getCatalogReviewSummary: mockGetCatalogReviewSummary,
    }),
);

const VehicleDetailsHandler = (
    await import(
        "../../../services/catalog/_product/details/vehicleDetailsHandler.js"
    )
).default;

const base = {
    cid: 1,
    item_type: "vehicle",
    brand_id: 10,
    brand_name: "Tesla",
    brand_country: "USA",
    model_id: 20,
    model_name: "Model 3",
    model_description: "EV",
    base_price: "45000",
    quantity: 2,
    is_active: 1,
    release_year: 2024,
};

const subtype = {
    year: 2024,
    condition: "new",
    mileage: 0,
    body_shape: "sedan",
    door_count: 4,
    drivetrain: "AWD",
};

describe("VehicleDetailsHandler._assemble", () => {
    let mediaAdapter;
    let handler;

    beforeEach(() => {
        jest.clearAllMocks();
        mediaAdapter = {
            getItemImages: jest.fn(),
            getVehicleHistoryReport: jest.fn(),
        };
        handler = new VehicleDetailsHandler({
            productDAO: {},
            optionsQuery: {},
            mediaAdapter,
        });
        mockGetPromotionsForItem.mockResolvedValue([]);
        mockGetCatalogReviewSummary.mockResolvedValue({
            review_count: 0,
            avg_rating: null,
        });
    });

    test("swallows NotFoundError from images and continues", async () => {
        mediaAdapter.getItemImages.mockRejectedValue(
            new NotFoundError("Media"),
        );

        const dto = await handler._assemble({
            base,
            subtype,
            customizations: [],
            equipped_options: [],
            history: null,
        });

        expect(dto.images).toEqual([]);
        expect(dto.history).toBeNull();
    });

    test("rethrows non-NotFoundError from images", async () => {
        mediaAdapter.getItemImages.mockRejectedValue(
            new DatabaseError("media down"),
        );

        await expect(
            handler._assemble({
                base,
                subtype,
                customizations: [],
                history: null,
            }),
        ).rejects.toBeInstanceOf(DatabaseError);
    });

    test("loads history report when media_id present", async () => {
        mediaAdapter.getItemImages.mockResolvedValue([
            { media_id: 1, url: "https://cdn/a.jpg", is_primary: 1 },
        ]);
        mediaAdapter.getVehicleHistoryReport.mockResolvedValue({
            media_id: 50,
            url: "https://cdn/report.pdf",
            alt_text: "Report",
        });

        const dto = await handler._assemble({
            base,
            subtype,
            customizations: [],
            history: { has_accidents: 0, owners_count: 1, media_id: 50 },
        });

        expect(dto.history.report.url).toBe("https://cdn/report.pdf");
        expect(mediaAdapter.getVehicleHistoryReport).toHaveBeenCalledWith(50);
    });

    test("swallows NotFoundError from history report", async () => {
        mediaAdapter.getItemImages.mockResolvedValue([]);
        mediaAdapter.getVehicleHistoryReport.mockRejectedValue(
            new NotFoundError("Media"),
        );

        const dto = await handler._assemble({
            base,
            subtype,
            customizations: [],
            history: { has_accidents: 1, owners_count: 2, media_id: 99 },
        });

        expect(dto.history.report).toBeNull();
    });

    test("rethrows non-NotFoundError from history report", async () => {
        mediaAdapter.getItemImages.mockResolvedValue([]);
        mediaAdapter.getVehicleHistoryReport.mockRejectedValue(
            new DatabaseError("report fetch failed"),
        );

        await expect(
            handler._assemble({
                base,
                subtype,
                customizations: [],
                history: { has_accidents: 0, owners_count: 1, media_id: 99 },
            }),
        ).rejects.toBeInstanceOf(DatabaseError);
    });

    test("skips history report fetch when history has no media_id", async () => {
        mediaAdapter.getItemImages.mockResolvedValue([]);

        await handler._assemble({
            base,
            subtype,
            customizations: [],
            history: { has_accidents: 0, owners_count: 1 },
        });

        expect(mediaAdapter.getVehicleHistoryReport).not.toHaveBeenCalled();
    });
});
