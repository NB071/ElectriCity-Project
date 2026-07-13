import { Router } from "express";
import { cartController } from "../../../controllers/api/shop/index.js";
import { authnMiddleware, authzIfAuthenticatedMiddleware, analyticsTrackMiddleware } from "../../../middlewares/index.js";
import { EVENT_DEFINITIONS } from "../../../services/analytics/constants.js";

const router = Router();

router.use(
    authnMiddleware({ optional: true }),
    authzIfAuthenticatedMiddleware("customer"),
);

router.get("/", cartController.getCart);
router.delete("/", cartController.clearCart);
router.post(
    "/items",
    analyticsTrackMiddleware(EVENT_DEFINITIONS.CART.ADD),
    cartController.addCartItem,
);
router.patch("/items/:cartItemId", cartController.updateCartItem);
router.delete(
    "/items/:cartItemId",
    analyticsTrackMiddleware(EVENT_DEFINITIONS.CART.REMOVE),
    cartController.removeCartItem,
);

export default router;
