import { Router } from "express";
import customerRoutes from "./customer.routes.js";
import adminAnalyticsRoutes from "./admin.analytics.routes.js";
import adminCatalogRoutes from "./admin.catalog.routes.js";
import adminReviewsRoutes from "./admin.reviews.routes.js";
import adminMediaRoutes from "./admin.media.routes.js";

const router = Router();

router.use("/customer", customerRoutes);
router.use("/admin", adminAnalyticsRoutes);
router.use("/admin", adminCatalogRoutes);
router.use("/admin", adminReviewsRoutes);
router.use("/admin", adminMediaRoutes);

export default router;
