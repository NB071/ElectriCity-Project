import { Router } from "express";
import * as authController from "../../../controllers/api/auth/auth.controller.js";
import { authnMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authnMiddleware, authController.logout);

export default router;
