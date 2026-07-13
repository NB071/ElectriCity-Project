import { Router } from "express";
import { adminReviewsController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware, analyticsTrackMiddleware } from "../../../middlewares/index.js";
import { EVENT_DEFINITIONS } from "../../../services/analytics/constants.js";

const router = Router();

router.get(
    "/reviews",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminReviewsController.getAllReviews,
);
router.get(
    "/reviews/catalog/:cid",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminReviewsController.getAllCatalogReviews,
);
router.get(
    "/reviews/:rid",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminReviewsController.getReviewDetail,
);
router.delete(
    "/reviews/:rid",
    authnMiddleware(),
    authzMiddleware("admin"),
    analyticsTrackMiddleware(EVENT_DEFINITIONS.REVIEW.DELETE_REVIEW),
    adminReviewsController.deleteReview,
);

export default router;
