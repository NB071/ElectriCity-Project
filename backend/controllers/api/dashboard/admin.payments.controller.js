import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import paymentService from "../../../services/payment/payment.service.js";
import { validateOrderPaymentStatus } from "../../../services/order/orderValidator.js";

/**
 * This controller returns paginated payment attempts across all users (admin view).
 * @route GET /api/dashboard/admin/payments
 * @required_role admin
 * @services_used Payment
 */
export const getAllPayments = tryCatch(async (req, res, _) => {
    const responseData = await paymentService.viewAllPaymentAttempts(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns full detail for one payment attempt by attempt_id.
 * @route GET /api/dashboard/admin/payments/:attemptId
 * @required_role admin
 * @services_used Payment
 */
export const getPaymentDetail = tryCatch(async (req, res, _) => {
    const responseData = await paymentService.getPaymentAttemptById(
        req.params.attemptId,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns all payment attempts for an order (admin view).
 * @route GET /api/dashboard/admin/orders/:orderId/payments
 * @required_role admin
 * @services_used Payment
 */
export const getOrderPayments = tryCatch(async (req, res, _) => {
    const responseData = await paymentService.getPaymentAttemptsByOrderId(
        req.params.orderId,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller manually updates an order's payment_status.
 * @route PATCH /api/dashboard/admin/orders/:orderId/payment-status
 * @required_role admin
 * @services_used Payment, Order
 */
export const updateOrderPaymentStatus = tryCatch(async (req, res, _) => {
    const payment_status = validateOrderPaymentStatus(req.body.payment_status);

    await paymentService.updateOrderPaymentStatus(
        req.params.orderId,
        payment_status,
    );

    return apiResponse(
        res,
        {
            order_id: Number(req.params.orderId),
            payment_status,
        },
        200,
    );
});
