import { jest } from "@jest/globals";

const mockGetCatalogReviewSummary = jest.fn();
const mockCountByCatalogItem = jest.fn();
const mockFindByCatalogItem = jest.fn();
const mockCountByUser = jest.fn();
const mockFindByUser = jest.fn();
const mockCountAllReviews = jest.fn();
const mockFindAllReviews = jest.fn();
const mockFindByIdWithAuthor = jest.fn();
const mockEnsureCatalogItemExists = jest.fn();

await jest.unstable_mockModule("../../../services/review/reviewDAO.js", () => ({
    default: {
        getCatalogReviewSummary: mockGetCatalogReviewSummary,
        countByCatalogItem: mockCountByCatalogItem,
        findByCatalogItem: mockFindByCatalogItem,
        countByUser: mockCountByUser,
        findByUser: mockFindByUser,
        countAllReviews: mockCountAllReviews,
        findAllReviews: mockFindAllReviews,
        findByIdWithAuthor: mockFindByIdWithAuthor,
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

const {
    getCatalogReviewSummary,
    viewCatalogReviews,
    viewCustomerReviews,
    viewAllCatalogReviews,
    viewAllReviews,
    viewReviewDetail,
} = await import("../../../services/review/reviewQuery.js");

const reviewRow = {
    review_id: 1,
    cid: 10,
    user_id: 7,
    rating: 5,
    title: "Great",
    body: "Loved it",
    created_at: "2025-01-01",
    first_name: "Ada",
    last_name: "Lovelace",
};

describe("reviewQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEnsureCatalogItemExists.mockResolvedValue(undefined);
    });

    test("getCatalogReviewSummary maps DAO summary", async () => {
        mockGetCatalogReviewSummary.mockResolvedValue({
            review_count: 2,
            avg_rating: "4.5",
        });

        const summary = await getCatalogReviewSummary(10);
        expect(summary.review_count).toBe(2);
        expect(summary.avg_rating).toBe(4.5);
    });

    test("viewCatalogReviews skips find when total is 0", async () => {
        mockCountByCatalogItem.mockResolvedValue(0);

        const result = await viewCatalogReviews(10, { page: 1, limit: 5 });

        expect(result.items).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(mockFindByCatalogItem).not.toHaveBeenCalled();
        expect(mockEnsureCatalogItemExists).toHaveBeenCalledWith(10, {
            requireActive: true,
        });
    });

    test("viewCatalogReviews fetches rows when total > 0", async () => {
        mockCountByCatalogItem.mockResolvedValue(1);
        mockFindByCatalogItem.mockResolvedValue([reviewRow]);

        const result = await viewCatalogReviews(10, { page: 1, limit: 5 });

        expect(result.items).toHaveLength(1);
        expect(mockFindByCatalogItem).toHaveBeenCalledWith(10, 5, 0);
    });

    test("viewCustomerReviews empty vs non-empty total", async () => {
        mockCountByUser.mockResolvedValueOnce(0);
        const empty = await viewCustomerReviews(7);
        expect(empty.items).toEqual([]);
        expect(mockFindByUser).not.toHaveBeenCalled();

        mockCountByUser.mockResolvedValueOnce(1);
        mockFindByUser.mockResolvedValueOnce([reviewRow]);
        const filled = await viewCustomerReviews(7, { page: 1, limit: 10 });
        expect(filled.items).toHaveLength(1);
        expect(mockFindByUser).toHaveBeenCalledWith(7, 10, 0);
    });

    test("viewAllCatalogReviews includes deleted authors and both totals", async () => {
        mockCountByCatalogItem.mockResolvedValueOnce(0);
        const empty = await viewAllCatalogReviews(10);
        expect(empty.items).toEqual([]);
        expect(mockCountByCatalogItem).toHaveBeenCalledWith(10, {
            includeDeletedAuthors: true,
        });
        expect(mockFindByCatalogItem).not.toHaveBeenCalled();

        mockCountByCatalogItem.mockResolvedValueOnce(1);
        mockFindByCatalogItem.mockResolvedValueOnce([reviewRow]);
        const filled = await viewAllCatalogReviews(10, { page: 1, limit: 5 });
        expect(filled.items).toHaveLength(1);
        expect(mockFindByCatalogItem).toHaveBeenCalledWith(10, 5, 0, {
            includeDeletedAuthors: true,
        });
    });

    test("viewAllReviews empty vs non-empty total", async () => {
        mockCountAllReviews.mockResolvedValueOnce(0);
        const empty = await viewAllReviews();
        expect(empty.items).toEqual([]);
        expect(mockFindAllReviews).not.toHaveBeenCalled();

        mockCountAllReviews.mockResolvedValueOnce(1);
        mockFindAllReviews.mockResolvedValueOnce([reviewRow]);
        const filled = await viewAllReviews({ page: 1, limit: 20 });
        expect(filled.items).toHaveLength(1);
        expect(mockFindAllReviews).toHaveBeenCalledWith(20, 0, {
            includeDeletedAuthors: true,
        });
    });

    test("viewReviewDetail maps admin detail row", async () => {
        mockFindByIdWithAuthor.mockResolvedValue(reviewRow);
        const detail = await viewReviewDetail(1);
        expect(detail).toBeDefined();
        expect(mockFindByIdWithAuthor).toHaveBeenCalledWith(1, {
            includeDeletedAuthors: true,
        });
    });
});
