// Media Service
// Strategy pattern / PDF strategy (concrete strategy)

import mediaDAO from "../mediaDAO.js";
import { VALIDATIONS } from "../constants.js";
import {
    validateCatalogImageInput,
    validatePdfMediaInput,
} from "../mediaValidator.js";
import MediaStrategy from "./MediaStrategy.js";

/**
 * Resolves PDF media for a given catalog item (like vehicle history reports).
 * @extends MediaStrategy (Strategy pattern)
 */
class PdfStrategy extends MediaStrategy {
    /**
     * Resolves all PDFs for a catalog item, returning URL references directly.
     * @param {number} cid
     * @returns {Promise<object[]>}
     * @throws {NotFoundError} If the media record does not exist
     * @throws {DatabaseError} On database failures
     */
    async resolve(cid) {
        const rows = await mediaDAO.findByCidAndType(
            cid,
            VALIDATIONS.ALLOWED_FILE_TYPES.PDF[0], // there's only one PDF type
        );

        return rows.map((r) => ({
            media_id: r.media_id,
            url: r.url,
            alt_text: r.alt_text,
        }));
    }

    /**
     * Inserts a PDF media record and optionally links it to a catalog item.
     * PDF assets cannot be marked as the primary catalog image.
     * @param {object} input
     * @param {string} input.url
     * @param {string} input.file_type
     * @param {string|null} [input.alt_text]
     * @param {number|null} [input.cid]
     * @param {number} [input.display_order]
     * @param {boolean} [input.is_primary]
     * @returns {Promise<{ media_id: number }>}
     * @throws {ValidationError} If file_type is invalid or is_primary is true
     * @throws {DatabaseError} On database failures
     * @throws {ConflictError} If the media record is already linked to the catalog item
     */
    async record({
        url,
        file_type,
        alt_text = null,
        cid = null,
        display_order = 0,
        is_primary = false,
    }) {
        const valid = validatePdfMediaInput({
            url,
            file_type,
            alt_text,
            is_primary,
        });

        const mediaId = await mediaDAO.insertMedia({
            url: valid.url,
            file_type: valid.file_type,
            alt_text: valid.alt_text ?? null,
        });

        if (cid) {
            validateCatalogImageInput({
                cid,
                media_id: mediaId,
                display_order,
                is_primary: false,
            });
            await mediaDAO.linkToCatalogItem({
                cid,
                media_id: mediaId,
                display_order,
                is_primary: false,
            });
        }

        return { media_id: mediaId };
    }
}

const pdfStrategy = new PdfStrategy();
export default pdfStrategy;
