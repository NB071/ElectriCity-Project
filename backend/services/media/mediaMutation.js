// Media Service
// CQRS - Mutation side (writes)

import mediaDAO from "./mediaDAO.js";
import {
    validateMediaInput,
    validateCatalogImageInput,
} from "./mediaValidator.js";
import { getStrategyForFileType } from "./strategies/index.js";

/**
 * This function inserts a new media record and optionally links it to a catalog item.
 * @param {object} input The input data to record the media on the database
 * @param {string} input.url The URL of the media record to be recorded on the database
 * @param {string} input.file_type The file type of the media record to be recorded on the database
 * @param {string} input.alt_text (optional, defaults to null) The alt text of the media record to be recorded on the database
 * @param {number} input.cid (optional, defaults to null) The primary key of the catalog item to link the media record to on the database
 * @param {number} input.display_order (optional, defaults to 0) The display order of the media record in the catalog item to be recorded on the database
 * @param {boolean} input.is_primary (optional, defaults to false) Whether the media record is the primary media record for the catalog item to be recorded on the database
 * @returns {Promise<{ media_id: number }>} The inserted media record's primary key
 * @throws {ValidationError} If the media record data is invalid
 * @throws {DatabaseError} On database failures
 * @throws {ConflictError} If the media record is already linked to the catalog item
 */
async function recordMedia({
    url,
    file_type,
    alt_text,
    cid,
    display_order,
    is_primary,
}) {
    validateMediaInput({ url, file_type, alt_text });

    return getStrategyForFileType(file_type).record({
        url,
        file_type,
        alt_text,
        cid,
        display_order,
        is_primary,
    });
}

/**
 * This function links an already recorded media record to a catalog item.
 * @param {object} input The input data to link the media record to the catalog item
 * @param {number} input.cid The primary key of the catalog item to link the media record to
 * @param {number} input.media_id The primary key of the media record to link to the catalog item
 * @param {number} input.display_order (optional, defaults to 0) The display order of the media record in the catalog item to be linked to the catalog item
 * @param {boolean} input.is_primary (optional, defaults to false) Whether the media record is the primary media record for the catalog item to be linked to the catalog item
 * @returns {Promise<void>}
 * @throws {ValidationError} If the media record data is invalid
 * @throws {DatabaseError} On database failures
 * @throws {ConflictError} If the media record is already linked to the catalog item
 */
async function linkMediaToCatalogItem({
    cid,
    media_id,
    display_order,
    is_primary,
}) {
    validateCatalogImageInput({ cid, media_id, display_order });
    await mediaDAO.linkToCatalogItem({
        cid,
        media_id,
        display_order,
        is_primary,
    });
}

/**
 * This function sets a media record as the primary image for a catalog item.
 * @param {number} cid The primary key of the catalog item to set the primary catalog image for
 * @param {number} media_id The primary key of the media record to set as the primary catalog image for the catalog item
 * @returns {Promise<void>} The media record is successfully set as the primary catalog image for the catalog item
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the media record is not linked to the catalog item
 * @throws {ConflictError} If the media record is already the primary media record for the catalog item
 */
async function setPrimaryCatalogImage(cid, media_id) {
    await mediaDAO.setPrimaryCatalogImage(cid, media_id);
}

/**
 * This function unlinks a media record from a catalog item.
 * @param {number} cid The primary key of the catalog item to unlink the media record from
 * @param {number} media_id The primary key of the media record to unlink from the catalog item
 * @returns {Promise<void>} The media record is successfully unlinked from the catalog item
 * @throws {ValidationError} If the media record data is invalid
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the media record is not linked to the catalog item
 */
async function unlinkMediaFromCatalogItem(cid, media_id) {
    await mediaDAO.unlinkFromCatalogItem(cid, media_id);
}

/**
 * Hard deletes a media record by ID.
 * catalog_images rows cascade on DELETE per schema FK definition.
 * @param {number} media_id The primary key of the media record to delete
 * @returns {Promise<void>} The media record is successfully deleted from the database
 * @throws {DatabaseError} On database failures
 * @throws {NotFoundError} If the media record does not exist
 */
async function deleteMediaById(media_id) {
    await mediaDAO.deleteMediaById(media_id);
}

export {
    recordMedia,
    linkMediaToCatalogItem,
    setPrimaryCatalogImage,
    unlinkMediaFromCatalogItem,
    deleteMediaById,
};
