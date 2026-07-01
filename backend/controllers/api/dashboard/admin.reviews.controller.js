import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import reviewService from "../../../services/review/review.service.js";

/**
 * This controller returns paginated reviews across all users (admin view).
 * @route GET /api/dashboard/admin/reviews
 * @required_role admin
 * @services_used Review
 */
export const getAllReviews = tryCatch(async (req, res, _) => {
    const responseData = await reviewService.viewAllReviews(req.query);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns paginated reviews for a catalog item (admin view).
 * @route GET /api/dashboard/admin/reviews/catalog/:cid
 * @required_role admin
 * @services_used Review
 */
export const getAllCatalogReviews = tryCatch(async (req, res, _) => {
    const responseData = await reviewService.viewAllCatalogReviews(
        req.params.cid,
        req.query,
    );
    return apiResponse(res, responseData, 200);
});

/**
 * This controller returns full detail for one review by rid (review_id).
 * @route GET /api/dashboard/admin/reviews/:rid
 * @required_role admin
 * @services_used Review
 */
export const getReviewDetail = tryCatch(async (req, res, _) => {
    const responseData = await reviewService.viewReviewDetail(req.params.rid);
    return apiResponse(res, responseData, 200);
});

/**
 * This controller hard-deletes a review by rid (review_id).
 * @route DELETE /api/dashboard/admin/reviews/:rid
 * @required_role admin
 * @services_used Review
 */
export const deleteReview = tryCatch(async (req, res, _) => {
    await reviewService.deleteReview(req.params.rid);
    return apiResponse(res, { review_id: Number(req.params.rid) }, 200);
});
