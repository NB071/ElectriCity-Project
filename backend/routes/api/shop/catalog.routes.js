import { Router } from "express";
import { catalogController } from "../../../controllers/api/shop/index.js";
import { authnMiddleware, authzMiddleware, analyticsTrackMiddleware } from "../../../middlewares/index.js";
import { EVENT_DEFINITIONS } from "../../../services/analytics/constants.js";

const router = Router();

// Public brand reads (must be registered before /:cid)
router.get("/brands", catalogController.listBrands);
router.get("/brands/:brandId", catalogController.getBrandById);

// Public catalog reads
router.get("/vehicles", catalogController.browseVehicles);
router.get("/vehicles/search", catalogController.searchVehicles);
router.get("/compare", catalogController.compareCatalogItems);

router.post("/configurations", catalogController.createConfiguration);
router.get("/configurations/:configId", catalogController.getConfigurationById);

router.get(
    "/:cid",
    analyticsTrackMiddleware(EVENT_DEFINITIONS.CATALOG.VEHICLE_DETAILS_VIEW),
    catalogController.getCatalogItemDetails,
);
router.get("/:cid/reviews", catalogController.getCatalogReviews);

// Customer-only catalog actions
router.get(
    "/:cid/wishlist",
    authnMiddleware(),
    authzMiddleware("customer"),
    catalogController.getWishlistStatus,
);
router.post(
    "/:cid/reviews",
    authnMiddleware(),
    authzMiddleware("customer"),
    analyticsTrackMiddleware(EVENT_DEFINITIONS.REVIEW.PUBLISH_REVIEW),
    catalogController.publishReview,
);

export default router;
