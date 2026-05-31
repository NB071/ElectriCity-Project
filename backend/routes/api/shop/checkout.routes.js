import { Router } from "express";
import { checkoutController } from "../../../controllers/api/shop/index.js";

const router = Router();

router.get("/sample", checkoutController.sampleController);

export default router;
