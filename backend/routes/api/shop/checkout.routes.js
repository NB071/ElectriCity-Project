import { Router } from "express";
import { checkoutController } from "../../../controllers/api/shop/index.js";
import { authnMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.post(
    "/calculate",
    authnMiddleware({ optional: true }),
    checkoutController.calculate,
);

router.post(
    "/",
    authnMiddleware({ optional: true }),
    checkoutController.checkout,
);

export default router;
