import { Router } from "express";
import { cartController } from "../../../controllers/api/shop/index.js";

const router = Router();

router.get("/sample", cartController.sampleController);

export default router;
