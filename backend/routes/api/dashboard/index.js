import { Router } from "express";
import customerRoutes from "./customer.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use("/customer", customerRoutes);
router.use("/admin", adminRoutes);

export default router;
