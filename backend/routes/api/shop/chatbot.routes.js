import { Router } from "express";
import { chatbotController } from "../../../controllers/api/shop/index.js";
import { chatbotRateLimiter } from "../../../middlewares/index.js";

const router = Router();

router.post(
    "/message",
    chatbotRateLimiter,
    chatbotController.sendMessageController,
);

export default router;
