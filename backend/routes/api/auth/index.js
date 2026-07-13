import { Router } from "express";
import * as authController from "../../../controllers/api/auth/auth.controller.js";
import { authnMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authnMiddleware(), authController.logout);
router.post("/logout-all", authnMiddleware(), authController.logoutAll);
router.get("/me/sessions", authnMiddleware(), authController.getMySessions);
router.get("/me", authnMiddleware(), authController.getMe);
router.patch("/me", authnMiddleware(), authController.updateMe);
router.delete("/me", authnMiddleware(), authController.deleteMe);

router.get(
    "/me/addresses",
    authnMiddleware(),
    authController.getMyAddresses,
);
router.post(
    "/me/addresses",
    authnMiddleware(),
    authController.addMyAddress,
);
router.get(
    "/me/addresses/:addressId",
    authnMiddleware(),
    authController.getMyAddress,
);
router.patch(
    "/me/addresses/:addressId",
    authnMiddleware(),
    authController.updateMyAddress,
);
router.delete(
    "/me/addresses/:addressId",
    authnMiddleware(),
    authController.deleteMyAddress,
);
router.patch(
    "/me/addresses/:addressId/default",
    authnMiddleware(),
    authController.setDefaultMyAddress,
);

export default router;
