// Media Service
// Strategy pattern / image strategy (concrete strategy)

import mediaDAO from "../mediaDAO.js";
import { VALIDATIONS } from "../constants.js";
import { validateCatalogImageInput, validateImageMediaInput } from "../mediaValidator.js";
import MediaStrategy from "./MediaStrategy.js";

/**
 * Resolves image media for a given catalog item.
 * @extends MediaStrategy (Strategy pattern)
 */
class ImageStrategy extends MediaStrategy {
    /**
     * Resolves all images for a catalog item, sorted by display_order.
     * @param {number} cid
     * @returns {Promise<object[]>}
     * @throws {NotFoundError} If the media record does not exist
     * @throws {DatabaseError} On database failures
     */
    async resolve(cid) {
        const results = [];

        for (const type of VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE) {
            const rows = await mediaDAO.findByCidAndType(cid, type);
            results.push(...rows);
        }

        return results.sort((a, b) => a.display_order - b.display_order);
    }

    /**
     * Inserts an image media record and optionally links it to a catalog item.
     * @param {object} input
     * @param {string} input.url
     * @param {string} input.file_type
     * @param {string|null} [input.alt_text]
     * @param {number|null} [input.cid]
     * @param {number} [input.display_order]
     * @param {boolean} [input.is_primary]
     * @returns {Promise<{ media_id: number }>}
     * @throws {ValidationError} If file_type is not an allowed image type
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
        const valid = validateImageMediaInput({ url, file_type, alt_text });

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
                is_primary,
            });
            await mediaDAO.linkToCatalogItem({
                cid,
                media_id: mediaId,
                display_order,
                is_primary,
            });
        }

        return { media_id: mediaId };
    }
}

const imageStrategy = new ImageStrategy();
export default imageStrategy;
