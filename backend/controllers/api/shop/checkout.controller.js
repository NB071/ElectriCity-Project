import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import orderService from "../../../services/order/order.service.js";
import cartService from "../../../services/cart/cart.service.js";

/**
 * This controller checks out the caller's own cart when authenticated, or the guest cart / explicit items when a guest.
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
    } = req.body;

    const responseData = await orderService.checkout({
        actor: orderService.CHECKOUT_ACTORS.CUSTOMER,
        userId: req.user?.user_id ?? null,
        sessionToken: req.headers[cartService.CART_HEADERS.SESSION] ?? null,
        guest_email,
        items,
        shipping_address,
        billing_address,
        payment_method,
        payment_details,
    });

    return apiResponse(res, responseData, 201);
});
