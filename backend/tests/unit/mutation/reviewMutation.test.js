import { jest } from "@jest/globals";

const mockInsertReview = jest.fn();
const mockDeleteById = jest.fn();
const mockEnsureCatalogItemExists = jest.fn();

await jest.unstable_mockModule("../../../services/review/reviewDAO.js", () => ({
    default: {
        insertReview: mockInsertReview,
        deleteById: mockDeleteById,
    },
}));

await jest.unstable_mockModule(
    "../../../services/catalog/catalog.service.js",
    () => ({
        default: {
            ensureCatalogItemExists: mockEnsureCatalogItemExists,
        },
    }),
);

const { publishReview, deleteReview } = await import(
    "../../../services/review/reviewMutation.js"
);

describe("reviewMutation", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEnsureCatalogItemExists.mockResolvedValue(undefined);
    });

    test("publishReview persists title when provided", async () => {
        mockInsertReview.mockResolvedValue({
            reviewId: 9,
            createdAt: "2025-01-01",
        });

        const result = await publishReview({
            userId: 1,
            cid: 2,
            title: "Great EV",
            body: "Loved it",
            rating: 5,
        });

        expect(mockInsertReview).toHaveBeenCalledWith({
            user_id: 1,
            cid: 2,
            title: "Great EV",
            body: "Loved it",
            rating: 5,
        });
        expect(result).toMatchObject({
            review_id: 9,
            cid: 2,
            title: "Great EV",
            rating: 5,
        });
    });

    test("publishReview stores null title when omitted", async () => {
        mockInsertReview.mockResolvedValue({
            reviewId: 10,
            createdAt: "2025-01-02",
        });

        const result = await publishReview({
            userId: 1,
            cid: 2,
            body: "Solid car",
            rating: 4,
        });

        expect(mockInsertReview).toHaveBeenCalledWith(
            expect.objectContaining({ title: null }),
        );
        expect(result.title).toBeNull();
    });

    test("deleteReview validates id and deletes", async () => {
        mockDeleteById.mockResolvedValue(undefined);

        await deleteReview("12");
        expect(mockDeleteById).toHaveBeenCalledWith(12);
    });
});
