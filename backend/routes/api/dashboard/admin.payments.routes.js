import { Router } from "express";
import { adminPaymentsController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.get(
    "/orders/:orderId/payments",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminPaymentsController.getOrderPayments,
);

router.patch(
    "/orders/:orderId/payment-status",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminPaymentsController.updateOrderPaymentStatus,
);

router.get(
    "/payments/:attemptId",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminPaymentsController.getPaymentDetail,
);

router.get(
    "/payments",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminPaymentsController.getAllPayments,
);

export default router;
