import { Router } from "express";
import { customerReviewsController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.get(
    "/reviews",
    authnMiddleware(),
    authzMiddleware("customer"),
    customerReviewsController.getCustomerReviews,
);

export default router;
