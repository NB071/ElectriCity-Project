import { jest } from "@jest/globals";
import { VALIDATIONS as MEDIA_VALIDATIONS } from "../../../services/media/constants.js";

const mockResolveMediaById = jest.fn();
const mockResolveMediaByCid = jest.fn();
const mockResolvePrimaryCatalogImage = jest.fn();
const mockResolvePreviewImagesByCids = jest.fn();

await jest.unstable_mockModule("../../../services/media/media.service.js", () => ({
    resolveMediaById: mockResolveMediaById,
    resolveMediaByCid: mockResolveMediaByCid,
    resolvePrimaryCatalogImage: mockResolvePrimaryCatalogImage,
    resolvePreviewImagesByCids: mockResolvePreviewImagesByCids,
}));

const mediaAdapter = (
    await import("../../../services/catalog/MediaAdapter.js")
).default;

describe("MediaAdapter", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getItemImages delegates with IMAGE media type", async () => {
        mockResolveMediaByCid.mockResolvedValue([{ media_id: 1 }]);

        await expect(mediaAdapter.getItemImages(9)).resolves.toEqual([
            { media_id: 1 },
        ]);
        expect(mockResolveMediaByCid).toHaveBeenCalledWith(
            9,
            MEDIA_VALIDATIONS.MEDIA_TYPES.IMAGE,
        );
    });

    test("getPrimaryImage delegates to resolvePrimaryCatalogImage", async () => {
        mockResolvePrimaryCatalogImage.mockResolvedValue({
            media_id: 2,
            url: "https://cdn/primary.jpg",
        });

        await expect(mediaAdapter.getPrimaryImage(9)).resolves.toEqual({
            media_id: 2,
            url: "https://cdn/primary.jpg",
        });
        expect(mockResolvePrimaryCatalogImage).toHaveBeenCalledWith(9);
    });

    test("getPreviewImagesByCids uses default limitPerCid", async () => {
        const map = new Map([[1, [{ media_id: 3 }]]]);
        mockResolvePreviewImagesByCids.mockResolvedValue(map);

        await expect(
            mediaAdapter.getPreviewImagesByCids([1, 2]),
        ).resolves.toBe(map);
        expect(mockResolvePreviewImagesByCids).toHaveBeenCalledWith([1, 2], 5);
    });

    test("getPreviewImagesByCids forwards custom limitPerCid", async () => {
        mockResolvePreviewImagesByCids.mockResolvedValue(new Map());

        await mediaAdapter.getPreviewImagesByCids([1], 2);
        expect(mockResolvePreviewImagesByCids).toHaveBeenCalledWith([1], 2);
    });

    test("getVehicleHistoryReport resolves media by id", async () => {
        mockResolveMediaById.mockResolvedValue({
            media_id: 44,
            file_type: "application/pdf",
        });

        await expect(
            mediaAdapter.getVehicleHistoryReport(44),
        ).resolves.toEqual({
            media_id: 44,
            file_type: "application/pdf",
        });
        expect(mockResolveMediaById).toHaveBeenCalledWith(44);
    });
});
