import { Router } from "express";
import { customerWishlistController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware, analyticsTrackMiddleware } from "../../../middlewares/index.js";
import { EVENT_DEFINITIONS } from "../../../services/analytics/constants.js";

const router = Router();

router.get(
    "/wishlist/ids",
    authnMiddleware(),
    authzMiddleware("customer"),
    customerWishlistController.getWishlistIds,
);
router.get(
    "/wishlist",
    authnMiddleware(),
    authzMiddleware("customer"),
    customerWishlistController.getWishlist,
);
router.post(
    "/wishlist",
    authnMiddleware(),
    authzMiddleware("customer"),
    analyticsTrackMiddleware(EVENT_DEFINITIONS.WISHLIST.ADD),
    customerWishlistController.addWishlistItem,
);
router.delete(
    "/wishlist/:cid",
    authnMiddleware(),
    authzMiddleware("customer"),
    analyticsTrackMiddleware(EVENT_DEFINITIONS.WISHLIST.REMOVE),
    customerWishlistController.removeWishlistItem,
);

export default router;
