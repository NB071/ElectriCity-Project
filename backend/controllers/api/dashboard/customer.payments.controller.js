import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import paymentService from "../../../services/payment/payment.service.js";

/**
 * This controller returns paginated payment attempts for the current user.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/dashboard/customer/payments
 * @required_role customer
 * @services_used Payment
 */
export const getCustomerPayments = tryCatch(async (req, res, _) => {
    const responseData = await paymentService.getPaymentAttemptsByUserId(
        req.user.user_id,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});
