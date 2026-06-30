// Catalog Service
// Adapter for media service integration

import {
    resolveMediaById,
    resolveMediaByCid,
    resolvePrimaryCatalogImage,
} from "../media/media.service.js";
import { VALIDATIONS as MEDIA_VALIDATIONS } from "../media/constants.js";

/**
 * This adapter is the only catalog entry point to the media service.
 * @class
 */
class MediaAdapter {
    /**
     * This method fetches all image media linked to a catalog item.
     * @dependency Media Service
     * @param {number} cid
     * @returns {Promise<object[]>}
     * @throws {NotFoundError} If the media record does not exist
     * @throws {DatabaseError} On database failures
     */
    async getItemImages(cid) {
        return resolveMediaByCid(cid, MEDIA_VALIDATIONS.MEDIA_TYPES.IMAGE);
    }

    /**
     * This method fetches the primary catalog image for a catalog item.
     * @dependency Media Service
     * @param {number} cid
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the media record does not exist
     * @throws {DatabaseError} On database failures
     */
    async getPrimaryImage(cid) {
        return resolvePrimaryCatalogImage(cid);
    }

    /**
     * Resolves the vehicle history PDF from the media table.
     * @dependency Media Service
     * @param {number} mediaId FK from vehicle_history.media_id
     * @returns {Promise<object>}
     * @throws {NotFoundError} If the media record does not exist
     * @throws {DatabaseError} On database failures
     */
    async getVehicleHistoryReport(mediaId) {
        return resolveMediaById(mediaId);
    }
}

const mediaAdapter = new MediaAdapter();
export default mediaAdapter;
