import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import orderService from "../../../services/order/order.service.js";
import { cartSessionFromRequest } from "../../../services/cart/helpers/attachCartSession.js";
import { clearCartSessionCookie } from "../../../services/cart/helpers/cartSessionCookie.js";

/**
 * This controller calculates checkout totals (subtotal, tax breakdown, total) without placing an order.
 * @route POST /api/shop/checkout/calculate
 * @services_used Order, Cart
 */
export const calculate = tryCatch(async (req, res, _) => {
    const { items, shipping_address } = req.body;

    const userId = req.user?.user_id ?? null;
    const actor =
        userId != null
            ? orderService.CHECKOUT_ACTORS.CUSTOMER
            : orderService.CHECKOUT_ACTORS.GUEST;

    const sessionToken = cartSessionFromRequest(req);

    const responseData = await orderService.calculateCheckoutTotals({
        actor,
        userId,
        sessionToken,
        items,
        shipping_address,
    });

    return apiResponse(res, responseData, 200);
});

/**
 * This controller checks out the caller's cart (customer) or guest cart / items (guest).
 * @route POST /api/shop/checkout
 * @services_used Order, Cart
 */
export const checkout = tryCatch(async (req, res, _) => {
    const {
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
        additional_information,
    } = req.body;

    // resolve the checkout actor
    const userId = req.user?.user_id ?? null;
    const actor =
        userId != null
            ? orderService.CHECKOUT_ACTORS.CUSTOMER
            : orderService.CHECKOUT_ACTORS.GUEST;

    const sessionToken = cartSessionFromRequest(req);

    // checkout
    const responseData = await orderService.checkout({
        actor,
        userId,
        sessionToken,
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
        additional_information,
    });

    if (actor === orderService.CHECKOUT_ACTORS.GUEST && sessionToken) {
        clearCartSessionCookie(res);
    }

    return apiResponse(res, responseData, 201);
});
