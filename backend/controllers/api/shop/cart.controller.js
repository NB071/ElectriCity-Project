import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import cartService from "../../../services/cart/cart.service.js";

/**
 * This controller returns the authenticated user's cart.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/shop/cart
 * @requiredRole customer
 * @services_used Cart
 */
export const getCart = tryCatch(async (req, res, _) => {
    const responseData = await cartService.viewCart(
        req.user.user_id,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller adds a catalog item to the user's cart.
 * userId comes from req.user.user_id, not the request body.
 * @route POST /api/shop/cart/items
 * @requiredRole customer
 * @services_used Cart
 */
export const addCartItem = tryCatch(async (req, res, _) => {
    const { cid, config_id: configId, quantity } = req.body;
    const responseData = await cartService.addToCart({
        userId: req.user.user_id,
        cid,
        configId: configId ?? null,
        quantity,
    });
    return apiResponse(res, responseData, 201);
});

/**
 * This controller updates the quantity of a cart line item.
 * userId comes from req.user.user_id, not the request body.
 * @route PATCH /api/shop/cart/items/:cartItemId
 * @requiredRole customer
 * @services_used Cart
 */
export const updateCartItem = tryCatch(async (req, res, _) => {
    const { quantity } = req.body;
    const responseData = await cartService.updateCartItemQuantity({
        userId: req.user.user_id,
        cartItemId: req.params.cartItemId,
        quantity,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller removes one item from the user's cart.
 * userId comes from req.user.user_id, not the request body.
 * @route DELETE /api/shop/cart/items/:cartItemId
 * @requiredRole customer
 * @services_used Cart
 */
export const removeCartItem = tryCatch(async (req, res, _) => {
    const responseData = await cartService.removeFromCart({
        userId: req.user.user_id,
        cartItemId: req.params.cartItemId,
    });
    return apiResponse(res, responseData, 200);
});

/**
 * This controller removes all items from the user's cart.
 * userId comes from req.user.user_id, not the request body.
 * @route DELETE /api/shop/cart
 * @requiredRole customer
 * @services_used Cart
 */
export const clearCart = tryCatch(async (req, res, _) => {
    await cartService.clearCart(req.user.user_id);
    return apiResponse(res, { cleared: true }, 200);
});
