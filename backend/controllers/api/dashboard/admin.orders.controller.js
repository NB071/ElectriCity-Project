import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import orderService from "../../../services/order/order.service.js";
import { validateOrderStatus } from "../../../services/order/orderValidator.js";

/**
 * This controller returns paginated orders across all users (admin view).
 * @route GET /api/dashboard/admin/orders
 * @required_role admin
 * @services_used Order
 */
export const getAllOrders = tryCatch(async (req, res, _) => {
    const responseData = await orderService.listAllOrders(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns full detail for one order (admin view).
 * @route GET /api/dashboard/admin/orders/:orderId
 * @required_role admin
 * @services_used Order
 */
export const getOrderDetail = tryCatch(async (req, res, _) => {
    const responseData = await orderService.getOrderDetailsForAdmin(
        req.params.orderId,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller updates an order's order_status.
 * @route PATCH /api/dashboard/admin/orders/:orderId/status
 * @required_role admin
 * @services_used Order
 */
export const updateOrderStatus = tryCatch(async (req, res, _) => {
    const order_status = validateOrderStatus(req.body.order_status);

    await orderService.updateOrderStatus(req.params.orderId, order_status);

    return apiResponse(
        res,
        { order_id: Number(req.params.orderId), order_status },
        200,
    );
});
