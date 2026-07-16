/**
 * TC_31 - Media Service - Admin Catalog Media Management
 * UC35
 *
 * Expected: link / set primary / unlink images; PDF history reports can be
 * recorded and resolved; invalid types / primary-PDF are rejected.
 */
import {
    recordMedia,
    linkMediaToCatalogItem,
    setPrimaryCatalogImage,
    unlinkMediaFromCatalogItem,
    resolveMediaByCid,
    resolvePrimaryCatalogImage,
} from "../services/media/media.service.js";
import {
    validateMediaInput,
    validatePdfMediaInput,
} from "../services/media/mediaValidator.js";
import { ValidationError } from "../utils/errors.js";
import { ACTIVE_CID, USED_CID_WITH_HISTORY } from "./helpers/tddFixtures.js";
import { deleteMedia } from "./helpers/cleanup.js";

describe("TC_31 Media Service - Admin Catalog Media Management (UC35)", () => {
    test("upload/link, set primary, and unlink image for a vehicle", async () => {
        const url = `https://cdn.example.com/tc31-${Date.now()}.jpg`;
        const { media_id } = await recordMedia({
            url,
            file_type: "image/jpeg",
            alt_text: "TC31 test image",
        });

        try {
            expect(media_id).toBeGreaterThan(0);

            await linkMediaToCatalogItem({
                cid: ACTIVE_CID,
                media_id,
                display_order: 99,
                is_primary: false,
            });

            let gallery = await resolveMediaByCid(ACTIVE_CID);
            expect(gallery.images.some((m) => m.media_id === media_id)).toBe(
                true,
            );

            await setPrimaryCatalogImage(ACTIVE_CID, media_id);
            const primary = await resolvePrimaryCatalogImage(ACTIVE_CID);
            expect(primary.media_id).toBe(media_id);

            await unlinkMediaFromCatalogItem(ACTIVE_CID, media_id);
            gallery = await resolveMediaByCid(ACTIVE_CID);
            expect(gallery.images.some((m) => m.media_id === media_id)).toBe(
                false,
            );
        } finally {
            await deleteMedia(media_id, ACTIVE_CID);
        }
    });

    test("PDF history report can be recorded and resolved for a vehicle", async () => {
        const url = `https://cdn.example.com/tc31-history-${Date.now()}.pdf`;
        const { media_id } = await recordMedia({
            url,
            file_type: "application/pdf",
            alt_text: "Vehicle history report",
            cid: USED_CID_WITH_HISTORY,
            display_order: 0,
            is_primary: false,
        });

        try {
            expect(media_id).toBeGreaterThan(0);

            const gallery = await resolveMediaByCid(USED_CID_WITH_HISTORY);
            expect(gallery.pdfs.some((m) => m.media_id === media_id)).toBe(true);

            await unlinkMediaFromCatalogItem(USED_CID_WITH_HISTORY, media_id);
        } finally {
            await deleteMedia(media_id, USED_CID_WITH_HISTORY);
        }
    });

    test("rejects unsupported file types and primary PDF images", () => {
        expect(() =>
            validateMediaInput({
                url: "https://cdn.example.com/x.exe",
                file_type: "application/exe",
            }),
        ).toThrow(ValidationError);

        expect(() =>
            validatePdfMediaInput({
                url: "https://cdn.example.com/report.pdf",
                file_type: "application/pdf",
                is_primary: true,
            }),
        ).toThrow(ValidationError);
    });
});
