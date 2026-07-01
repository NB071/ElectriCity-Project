import { Router } from "express";
import * as authController from "../../../controllers/api/auth/auth.controller.js";
import { authnMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authnMiddleware, authController.logout);
router.get("/me", authnMiddleware, authController.getMe);
router.patch("/me", authnMiddleware, authController.updateMe);
router.delete("/me", authnMiddleware, authController.deleteMe);

export default router;
