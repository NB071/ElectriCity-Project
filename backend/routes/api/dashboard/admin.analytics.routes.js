import { Router } from "express";
import { adminAnalyticsController } from "../../../controllers/api/dashboard/index.js";
import {
  authnMiddleware,
  authzMiddleware,
} from "../../../middlewares/index.js";

const router = Router();

router.get(
  "/analytics/overview",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.getOverview,
);

router.get(
  "/analytics/reports/breakdown",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.getEventTypeBreakdown,
);
router.get(
  "/analytics/reports/trend/:eventTypeId",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.getTrend,
);
router.get(
  "/analytics/reports/top-items/:eventTypeId",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.getTopCatalogItems,
);
router.get(
  "/analytics/events",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.listEvents,
);
router.get(
  "/analytics/events/:eventId",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.getEventDetail,
);
router.get(
  "/analytics/event-types",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.listEventTypes,
);
router.patch(
  "/analytics/event-types/:eventTypeId/active",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminAnalyticsController.setEventTypeActive,
);

export default router;
