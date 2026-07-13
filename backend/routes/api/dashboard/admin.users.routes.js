import { Router } from "express";
import { adminUsersController } from "../../../controllers/api/dashboard/index.js";
import { authnMiddleware, authzMiddleware } from "../../../middlewares/index.js";

const router = Router();

router.get(
    "/users/search",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminUsersController.searchUsers,
);
router.get(
    "/users",
    authnMiddleware(),
    authzMiddleware("admin"),
    adminUsersController.getAllUsers,
);

export default router;
