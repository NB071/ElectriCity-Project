import { Router } from "express";
import { customerOrdersController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.get(
    "/orders",
    authnMiddleware(),
    authzMiddleware("customer"),
    customerOrdersController.getCustomerOrders,
);

router.get(
    "/orders/:orderId",
    authnMiddleware(),
    authzMiddleware("customer"),
    customerOrdersController.getCustomerOrderDetail,
);

export default router;
