import { Router } from "express";
import { customerAnalyticsController } from "../../../controllers/api/dashboard/index.js";
import {
  authnMiddleware,
  authzMiddleware,
} from "../../../middlewares/index.js";

const router = Router();

router.get(
  "/analytics/overview",
  authnMiddleware(),
  authzMiddleware("customer"),
  customerAnalyticsController.getOverview,
);

export default router;
