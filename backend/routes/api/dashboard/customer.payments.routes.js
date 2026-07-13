import { Router } from "express";
import { customerPaymentsController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.get(
    "/payments",
    authnMiddleware(),
    authzMiddleware("customer"),
    customerPaymentsController.getCustomerPayments,
);

export default router;
