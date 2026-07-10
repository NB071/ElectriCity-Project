import { Router } from "express";
import { checkoutController } from "../../../controllers/api/shop/index.js";
import { authnOptionalMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.post("/", authnOptionalMiddleware, checkoutController.checkout);

export default router;
