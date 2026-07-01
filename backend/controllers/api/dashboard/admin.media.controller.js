import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import {
    recordMedia,
    linkMediaToCatalogItem,
    setPrimaryCatalogImage,
    unlinkMediaFromCatalogItem,
    deleteMediaById,
} from "../../../services/media/media.service.js";

/**
 * This controller records a new media asset and optionally links it to a catalog item.
 * @route POST /api/dashboard/admin/media
 * @required_role admin
 * @services_used Media
 */
export const createMedia = tryCatch(async (req, res, _) => {
    const { url, file_type, alt_text, cid, display_order, is_primary } =
        req.body;
    const responseData = await recordMedia({
        url,
        file_type,
        alt_text,
        cid,
        display_order,
        is_primary,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller links an existing media record to a catalog item.
 * @route POST /api/dashboard/admin/catalog/:cid/media
 * @required_role admin
 * @services_used Media
 */
export const linkCatalogMedia = tryCatch(async (req, res, _) => {
    const { media_id, display_order, is_primary } = req.body;
    await linkMediaToCatalogItem({
        cid: req.params.cid,
        media_id,
        display_order,
        is_primary,
    });
    return apiResponse(
        res,
        { cid: Number(req.params.cid), media_id: Number(media_id) },
        201,
    );
});

/**
 * This controller sets the primary catalog image for a catalog item.
 * @route PATCH /api/dashboard/admin/catalog/:cid/media/:mediaId/primary
 * @required_role admin
 * @services_used Media
 */
export const setPrimaryMedia = tryCatch(async (req, res, _) => {
    await setPrimaryCatalogImage(req.params.cid, req.params.mediaId);
    return apiResponse(
        res,
        {
            cid: Number(req.params.cid),
            media_id: Number(req.params.mediaId),
            is_primary: true,
        },
        200,
    );
});

/**
 * This controller unlinks a media record from a catalog item.
 * @route DELETE /api/dashboard/admin/catalog/:cid/media/:mediaId
 * @requiredRole admin
 * @services_used Media
 */
export const unlinkCatalogMedia = tryCatch(async (req, res, _) => {
    await unlinkMediaFromCatalogItem(req.params.cid, req.params.mediaId);
    return apiResponse(
        res,
        {
            cid: Number(req.params.cid),
            media_id: Number(req.params.mediaId),
        },
        200,
    );
});

/**
 * This controller hard-deletes a media record by media_id.
 * @route DELETE /api/dashboard/admin/media/:mediaId
 * @requiredRole admin
 * @services_used Media
 */
export const deleteMedia = tryCatch(async (req, res, _) => {
    await deleteMediaById(req.params.mediaId);
    return apiResponse(res, { media_id: Number(req.params.mediaId) }, 200);
});
