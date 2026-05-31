import { Router } from "express";
import { chatbotController } from "../../../controllers/api/shop/index.js";

const router = Router();

router.get("/sample", chatbotController.sampleController);

export default router;
