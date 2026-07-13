import { Router } from "express";
import { adminOrdersController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.get(
    "/orders",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminOrdersController.getAllOrders,
);

router.get(
    "/orders/:orderId",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminOrdersController.getOrderDetail,
);

router.patch(
    "/orders/:orderId/status",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminOrdersController.updateOrderStatus,
);

export default router;
