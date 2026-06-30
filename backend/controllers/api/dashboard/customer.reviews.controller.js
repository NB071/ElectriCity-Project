import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import reviewService from "../../../services/review/review.service.js";

/**
 * This controller returns paginated reviews authored by the current user.
 * userId comes from req.user.user_id, not the request body.
 * @route GET /api/dashboard/customer/reviews
 * @requiredRole customer
 * @services_used Review
 */
export const getCustomerReviews = tryCatch(async (req, res, _) => {
    const responseData = await reviewService.viewCustomerReviews(
        req.user.user_id,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});
