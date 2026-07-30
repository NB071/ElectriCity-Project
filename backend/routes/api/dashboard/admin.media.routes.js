import { Router } from "express";
import { adminMediaController } from "../../../controllers/api/dashboard/index.js";
import {
  authnMiddleware,
  authzMiddleware,
} from "../../../middlewares/index.js";

const router = Router();

router.get(
  "/media",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminMediaController.getMediaList,
);

router.post(
  "/media",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminMediaController.createMedia,
);
router.delete(
  "/media/:mediaId",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminMediaController.deleteMedia,
);
router.post(
  "/catalog/:cid/media",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminMediaController.linkCatalogMedia,
);
router.patch(
  "/catalog/:cid/media/:mediaId/primary",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminMediaController.setPrimaryMedia,
);
router.delete(
  "/catalog/:cid/media/:mediaId",
  authnMiddleware(),
  authzMiddleware("admin"),
  adminMediaController.unlinkCatalogMedia,
);

export default router;
