// Review Service (Facade)

import { publishReview, deleteReview } from "./reviewMutation.js";
import {
    viewCatalogReviews,
    viewCustomerReviews,
    viewAllCatalogReviews,
    viewAllReviews,
    viewReviewDetail,
} from "./reviewQuery.js";
import { VALIDATIONS } from "./constants.js";

const reviewService = {
    publishReview,
    deleteReview,
    viewCatalogReviews,
    viewCustomerReviews,
    viewAllCatalogReviews,
    viewAllReviews,
    viewReviewDetail,
    VALIDATIONS,
};

export default reviewService;

export {
    publishReview,
    deleteReview,
    viewCatalogReviews,
    viewCustomerReviews,
    viewAllCatalogReviews,
    viewAllReviews,
    viewReviewDetail,
    VALIDATIONS,
};
