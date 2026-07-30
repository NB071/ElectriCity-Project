import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import wishlistService from "../../../services/wishlist/wishlist.service.js";

/**
 * This controller returns all wishlist catalog item ids for the current user.
 * Lightweight membership payload for shop bookmark toggles.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/dashboard/customer/wishlist/ids
 * @required_role customer
 * @services_used Wishlist
 */
export const getWishlistIds = tryCatch(async (req, res, _) => {
    const responseData = await wishlistService.listWishlistIds(req.user.user_id);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns paginated wishlist items for the current user.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/dashboard/customer/wishlist
 * @required_role customer
 * @services_used Wishlist
 */
export const getWishlist = tryCatch(async (req, res, _) => {
    const responseData = await wishlistService.viewWishlist(
        req.user.user_id,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller adds a catalog item to the current user's wishlist.
 * userId comes from req.user.user_id, not the request body.
 * @route POST /api/dashboard/customer/wishlist
 * @required_role customer
 * @services_used Wishlist
 */
export const addWishlistItem = tryCatch(async (req, res, _) => {
    const { cid } = req.body;
    const responseData = await wishlistService.addToWishlist({
        userId: req.user.user_id,
        cid,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller removes a catalog item from the current user's wishlist.
 * userId comes from req.user.user_id, not the request body.
 * @route DELETE /api/dashboard/customer/wishlist/:cid
 * @required_role customer
 * @services_used Wishlist
 */
export const removeWishlistItem = tryCatch(async (req, res, _) => {
    await wishlistService.removeFromWishlist({
        userId: req.user.user_id,
        cid: req.params.cid,
    });
    return apiResponse(res, { cid: Number(req.params.cid) }, 200);
});
