import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import cartService from "../../../services/cart/cart.service.js";
import { cartOwnerFromRequest } from "../../../services/cart/helpers/cartOwnerFromRequest.js";
import { attachCartSession } from "../../../services/cart/helpers/attachCartSession.js";

/**
 * This controller returns the caller's cart (customer or guest) with paginated items.
 * @route GET /api/shop/cart
 * @services_used Cart
 */
export const getCart = tryCatch(async (req, res, _) => {
    const responseData = attachCartSession(
        res,
        await cartService.viewCart(cartOwnerFromRequest(req), req.query),
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns a lite cart summary for the shop header
 * (counts, subtotal, and a small preview list without full line DTOs).
 * @route GET /api/shop/cart/summary
 * @services_used Cart
 */
export const getCartSummary = tryCatch(async (req, res, _) => {
    const responseData = attachCartSession(
        res,
        await cartService.viewCartSummary(
            cartOwnerFromRequest(req),
            req.query,
        ),
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller adds a catalog item to the caller's cart (customer JWT or guest session).
 * @route POST /api/shop/cart/items
 * @services_used Cart
 */
export const addCartItem = tryCatch(async (req, res, _) => {
    const { cid, config_id: configId, quantity } = req.body;
    const owner = cartOwnerFromRequest(req);
    const responseData = attachCartSession(
        res,
        await cartService.addToCart({
            ...owner,
            cid,
            configId: configId ?? null,
            quantity,
        }),
    );
    res.locals.cid = responseData.cid;
    return apiResponse(res, responseData, 201);
});

/**
 * This controller updates the quantity of a cart item.
 * @route PATCH /api/shop/cart/items/:cartItemId
 * @services_used Cart
 */
export const updateCartItem = tryCatch(async (req, res, _) => {
    const { quantity } = req.body;
    const responseData = attachCartSession(
        res,
        await cartService.updateCartItemQuantity({
            ...cartOwnerFromRequest(req),
            cartItemId: req.params.cartItemId,
            quantity,
        }),
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller removes one item from the caller's cart.
 * @route DELETE /api/shop/cart/items/:cartItemId
 * @services_used Cart
 */
export const removeCartItem = tryCatch(async (req, res, _) => {
    const responseData = attachCartSession(
        res,
        await cartService.removeFromCart({
            ...cartOwnerFromRequest(req),
            cartItemId: req.params.cartItemId,
        }),
    );
    res.locals.cid = responseData.cid;
    return apiResponse(res, responseData, 200);
});

/**
 * This controller removes all items from the caller's cart.
 * @route DELETE /api/shop/cart
 * @services_used Cart
 */
export const clearCart = tryCatch(async (req, res, _) => {
    const responseData = attachCartSession(
        res,
        await cartService.clearCart(cartOwnerFromRequest(req)),
    );
    return apiResponse(res, { cleared: true, ...responseData }, 200);
});
