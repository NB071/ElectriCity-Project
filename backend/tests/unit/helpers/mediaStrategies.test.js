import { jest } from "@jest/globals";
import { InternalError, ValidationError } from "../../../utils/errors.js";
import { VALIDATIONS } from "../../../services/media/constants.js";

const mockFindByCidAndType = jest.fn();
const mockInsertMedia = jest.fn();
const mockLinkToCatalogItem = jest.fn();

await jest.unstable_mockModule("../../../services/media/mediaDAO.js", () => ({
    default: {
        findByCidAndType: mockFindByCidAndType,
        insertMedia: mockInsertMedia,
        linkToCatalogItem: mockLinkToCatalogItem,
    },
}));

const imageStrategy = (
    await import("../../../services/media/strategies/ImageStrategy.js")
).default;
const pdfStrategy = (
    await import("../../../services/media/strategies/PdfStrategy.js")
).default;
const MediaContext = (
    await import("../../../services/media/strategies/MediaContext.js")
).default;

describe("MediaContext", () => {
    test("resolve/record throw when strategy is unset", () => {
        const ctx = new MediaContext();
        expect(() => ctx.resolve(1)).toThrow(InternalError);
        expect(() =>
            ctx.record({
                url: "https://cdn/a.jpg",
                file_type: "image/jpeg",
            }),
        ).toThrow(InternalError);
    });

    test("delegates to set strategy", async () => {
        const ctx = new MediaContext();
        const strategy = {
            resolve: jest.fn().mockResolvedValue([{ media_id: 1 }]),
            record: jest.fn().mockResolvedValue({ media_id: 2 }),
        };
        ctx.setStrategy(strategy);

        await expect(ctx.resolve(9)).resolves.toEqual([{ media_id: 1 }]);
        await expect(
            ctx.record({ url: "https://cdn/a.jpg", file_type: "image/jpeg" }),
        ).resolves.toEqual({ media_id: 2 });
        expect(strategy.resolve).toHaveBeenCalledWith(9);
    });
});

describe("ImageStrategy", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("resolve merges types and sorts by display_order", async () => {
        mockFindByCidAndType.mockImplementation(async (_cid, type) => {
            if (type === "image/jpeg") {
                return [{ media_id: 2, display_order: 2, file_type: type }];
            }
            if (type === "image/png") {
                return [{ media_id: 1, display_order: 0, file_type: type }];
            }
            return [];
        });

        const rows = await imageStrategy.resolve(10);
        expect(rows.map((r) => r.media_id)).toEqual([1, 2]);
        expect(mockFindByCidAndType).toHaveBeenCalledTimes(
            VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE.length,
        );
    });

    test("record without cid skips linking", async () => {
        mockInsertMedia.mockResolvedValue(55);

        await expect(
            imageStrategy.record({
                url: "https://cdn/a.jpg",
                file_type: "image/jpeg",
            }),
        ).resolves.toEqual({ media_id: 55 });
        expect(mockLinkToCatalogItem).not.toHaveBeenCalled();
    });

    test("record with cid links to catalog item", async () => {
        mockInsertMedia.mockResolvedValue(77);
        mockLinkToCatalogItem.mockResolvedValue(undefined);

        await expect(
            imageStrategy.record({
                url: "https://cdn/a.png",
                file_type: "image/png",
                alt_text: "Front",
                cid: 3,
                display_order: 1,
                is_primary: true,
            }),
        ).resolves.toEqual({ media_id: 77 });

        expect(mockLinkToCatalogItem).toHaveBeenCalledWith({
            cid: 3,
            media_id: 77,
            display_order: 1,
            is_primary: true,
        });
    });
});

describe("PdfStrategy", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("resolve maps pdf rows", async () => {
        mockFindByCidAndType.mockResolvedValue([
            {
                media_id: 9,
                url: "https://cdn/r.pdf",
                alt_text: "History",
                display_order: 0,
            },
        ]);

        await expect(pdfStrategy.resolve(1)).resolves.toEqual([
            {
                media_id: 9,
                url: "https://cdn/r.pdf",
                alt_text: "History",
            },
        ]);
        expect(mockFindByCidAndType).toHaveBeenCalledWith(
            1,
            "application/pdf",
        );
    });

    test("record without cid skips linking", async () => {
        mockInsertMedia.mockResolvedValue(12);
        await expect(
            pdfStrategy.record({
                url: "https://cdn/r.pdf",
                file_type: "application/pdf",
            }),
        ).resolves.toEqual({ media_id: 12 });
        expect(mockLinkToCatalogItem).not.toHaveBeenCalled();
    });

    test("record with cid always links as non-primary", async () => {
        mockInsertMedia.mockResolvedValue(13);
        mockLinkToCatalogItem.mockResolvedValue(undefined);

        await expect(
            pdfStrategy.record({
                url: "https://cdn/r.pdf",
                file_type: "application/pdf",
                cid: 4,
                display_order: 2,
            }),
        ).resolves.toEqual({ media_id: 13 });

        expect(mockLinkToCatalogItem).toHaveBeenCalledWith({
            cid: 4,
            media_id: 13,
            display_order: 2,
            is_primary: false,
        });
    });

    test("record rejects is_primary true for pdf", async () => {
        await expect(
            pdfStrategy.record({
                url: "https://cdn/r.pdf",
                file_type: "application/pdf",
                is_primary: true,
            }),
        ).rejects.toBeInstanceOf(ValidationError);
        expect(mockInsertMedia).not.toHaveBeenCalled();
    });
});
