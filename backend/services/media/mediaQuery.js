// Media Service
// CQRS - Query side (reads)

import mediaDAO from "./mediaDAO.js";
import getStrategy from "./strategies/index.js";
import { VALIDATIONS } from "./constants.js";

/**
 * This function resolves a single media record by its media ID.
 * @param {number} media_id
 * @returns {Promise<object|null>} The resolved media record or null if the media record does not exist
 * @throws {NotFoundError} If the media record does not exist
 * @throws {DatabaseError} On database failures
 */
async function resolveMediaById(media_id) {
    const media = await mediaDAO.findById(media_id);

    return media;
}

/**
 * This function resolves all media for a catalog item.
 * If mediaType is provided the relevant strategy is used to resolve the media.
 * If omitted all strategies are run and the results are grouped.
 * @param {number} cid
 * @param {string|null} mediaType Value from VALIDATIONS.MEDIA_TYPES constants
 * @returns {Promise<object[]|{ images: object[], pdfs: object[] }>} The resolved media records or grouped results
 * @throws {NotFoundError} If the media record does not exist
 * @throws {DatabaseError} On database failures
 */
async function resolveMediaByCid(cid, mediaType = null) {
    if (mediaType) {
        return getStrategy(mediaType).resolve(cid);
    }

    const [images, pdfs] = await Promise.all([
        getStrategy(VALIDATIONS.MEDIA_TYPES.IMAGE).resolve(cid),
        getStrategy(VALIDATIONS.MEDIA_TYPES.PDF).resolve(cid),
    ]);

    return { images, pdfs };
}

/**
 * This function resolves the primary catalog image for a catalog item.
 * This is used by catalog listing cards where only one image is needed.
 * @param {number} cid
 * @returns {Promise<object|null>} The resolved primary catalog image record or null if the primary catalog image record does not exist
 * @throws {NotFoundError} If the primary catalog image record does not exist
 * @throws {DatabaseError} On database failures
 */
async function resolvePrimaryCatalogImage(cid) {
    return mediaDAO.findPrimaryByCid(cid);
}

export { resolveMediaById, resolveMediaByCid, resolvePrimaryCatalogImage };
