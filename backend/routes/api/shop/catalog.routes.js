import { Router } from "express";
import { catalogController } from "../../../controllers/api/shop/index.js";

const router = Router();

router.get("/sample", catalogController.sampleController);

export default router;
