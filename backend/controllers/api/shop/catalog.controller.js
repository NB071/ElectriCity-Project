import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import catalogService from "../../../services/catalog/catalog.service.js";
import reviewService from "../../../services/review/review.service.js";
import wishlistService from "../../../services/wishlist/wishlist.service.js";

/**
 * This controller lists brands.
 * Pass `lite=true` for filter UIs (`{ id, name }` only, unpaginated, A-Z).
 * Pass `is_featured=true` for the homepage premium strip (unpaginated).
 * Otherwise returns a paginated list ordered by display_order.
 * @route GET /api/shop/catalog/brands
 * @requiredRole N/A
 * @services_used Catalog
 */
export const listBrands = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.listBrands(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns one brand by ID.
 * @route GET /api/shop/catalog/brands/:brandId
 * @requiredRole N/A
 * @services_used Catalog
 */
export const getBrandById = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.getBrandById(req.params.brandId);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller browses catalog vehicles with filters, sort, and pagination.
 * @route GET /api/shop/catalog/vehicles
 * @requiredRole N/A
 * @services_used Catalog
 */
export const browseVehicles = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.browseVehicles(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller searches catalog vehicles by keyword (model or brand name) with optional filters.
 * @route GET /api/shop/catalog/vehicles/search
 * @requiredRole N/A
 * @services_used Catalog
 */
export const searchVehicles = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.searchVehicles(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller compares two or more catalog items side by side.
 * Accepts `cids` as repeated query params or a comma-separated list.
 * @route GET /api/shop/catalog/compare
 * @requiredRole N/A
 * @services_used Catalog
 */
export const compareCatalogItems = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.compareCatalogItems(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns full details for a catalog item.
 * @route GET /api/shop/catalog/:cid
 * @requiredRole N/A
 * @services_used Catalog
 */
export const getCatalogItemDetails = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.getCatalogItemDetails(
        req.params.cid,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller creates a saved configuration for a catalog item.
 * @route POST /api/shop/catalog/configurations
 * @requiredRole N/A
 * @services_used Catalog
 */
export const createConfiguration = tryCatch(async (req, res, _) => {
    const { cid, option_ids: optionIds } = req.body;
    const responseData = await catalogService.createConfiguration({
        cid,
        option_ids: optionIds,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller returns a saved configuration by ID.
 * @route GET /api/shop/catalog/configurations/:configId
 * @requiredRole N/A
 * @services_used Catalog
 */
export const getConfigurationById = tryCatch(async (req, res, _) => {
    const responseData = await catalogService.getConfigurationById(
        req.params.configId,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns paginated reviews for a catalog item (detail page).
 * @route GET /api/shop/catalog/:cid/reviews
 * @requiredRole N/A
 * @services_used Review
 */
export const getCatalogReviews = tryCatch(async (req, res, _) => {
    const responseData = await reviewService.viewCatalogReviews(
        req.params.cid,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller publishes a review for a catalog item.
 * userId comes from req.user.user_id, not the request body.
 * @route POST /api/shop/catalog/:cid/reviews
 * @requiredRole customer
 * @services_used Review
 */
export const publishReview = tryCatch(async (req, res, _) => {
    const { title, body, rating } = req.body;
    const responseData = await reviewService.publishReview({
        userId: req.user.user_id,
        cid: req.params.cid,
        title: title ?? null,
        body,
        rating,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller checks whether a catalog item is in the current user's wishlist.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/shop/catalog/:cid/wishlist
 * @requiredRole customer
 * @services_used Wishlist
 */
export const getWishlistStatus = tryCatch(async (req, res, _) => {
    const responseData = await wishlistService.isInWishlist(
        req.user.user_id,
        req.params.cid,
    );
    return apiResponse(res, responseData, 200);
});
