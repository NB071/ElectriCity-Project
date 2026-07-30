import { Router } from "express";
import customerAnalyticsRoutes from "./customer.analytics.routes.js";
import customerReviewsRoutes from "./customer.reviews.routes.js";
import customerOrdersRoutes from "./customer.orders.routes.js";
import customerPaymentsRoutes from "./customer.payments.routes.js";
import customerWishlistRoutes from "./customer.wishlist.routes.js";
import adminAnalyticsRoutes from "./admin.analytics.routes.js";
import adminCatalogRoutes from "./admin.catalog.routes.js";
import adminOrdersRoutes from "./admin.orders.routes.js";
import adminPaymentsRoutes from "./admin.payments.routes.js";
import adminReviewsRoutes from "./admin.reviews.routes.js";
import adminMediaRoutes from "./admin.media.routes.js";
import adminUsersRoutes from "./admin.users.routes.js";

const router = Router();

router.use("/customer", customerAnalyticsRoutes);
router.use("/customer", customerReviewsRoutes);
router.use("/customer", customerOrdersRoutes);
router.use("/customer", customerPaymentsRoutes);
router.use("/customer", customerWishlistRoutes);
router.use("/admin", adminAnalyticsRoutes);
router.use("/admin", adminCatalogRoutes);
router.use("/admin", adminOrdersRoutes);
router.use("/admin", adminPaymentsRoutes);
router.use("/admin", adminReviewsRoutes);
router.use("/admin", adminMediaRoutes);
router.use("/admin", adminUsersRoutes);

export default router;
