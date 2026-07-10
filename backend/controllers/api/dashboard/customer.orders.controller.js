import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import orderService from "../../../services/order/order.service.js";

/**
 * This controller returns paginated orders for the current user.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/dashboard/customer/orders
 * @required_role customer
 * @services_used Order
 */
export const getCustomerOrders = tryCatch(async (req, res, _) => {
    const responseData = await orderService.listOrdersByUserId(
        req.user.user_id,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns full detail for one of the current user's orders.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/dashboard/customer/orders/:orderId
 * @required_role customer
 * @services_used Order
 */
export const getCustomerOrderDetail = tryCatch(async (req, res, _) => {
    const responseData = await orderService.getOrderDetailsForUser(
        req.user.user_id,
        req.params.orderId,
    );
    return apiResponse(res, responseData, 200);
});
