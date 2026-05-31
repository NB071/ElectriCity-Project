import { Router } from "express";
import cartRoutes from "./cart.routes.js";
import catalogRoutes from "./catalog.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import chatbotRoutes from "./chatbot.routes.js";

const router = Router();

router.use("/cart", cartRoutes);
router.use("/catalog", catalogRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/chatbot", chatbotRoutes);

export default router;
