import { Router } from "express";
import { cartController } from "../../../controllers/api/shop/index.js";
import {
    authnMiddleware,
    authzMiddleware,
    analyticsTrackMiddleware,
} from "../../../middlewares/index.js";
import { EVENT_DEFINITIONS } from "../../../services/analytics/constants.js";

const router = Router();

router.get(
    "/",
    authnMiddleware,
    authzMiddleware("customer"),
    cartController.getCart,
);
router.delete(
    "/",
    authnMiddleware,
    authzMiddleware("customer"),
    cartController.clearCart,
);
router.post(
    "/items",
    authnMiddleware,
    authzMiddleware("customer"),
    analyticsTrackMiddleware(EVENT_DEFINITIONS.CART.ADD),
    cartController.addCartItem,
);
router.patch(
    "/items/:cartItemId",
    authnMiddleware,
    authzMiddleware("customer"),
    cartController.updateCartItem,
);
router.delete(
    "/items/:cartItemId",
    authnMiddleware,
    authzMiddleware("customer"),
    analyticsTrackMiddleware(EVENT_DEFINITIONS.CART.REMOVE),
    cartController.removeCartItem,
);

export default router;
