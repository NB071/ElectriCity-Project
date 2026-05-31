import { Router } from "express";
import { adminController } from "../../../controllers/api/dashboard/index.js";

const router = Router();

router.get("/sample", adminController.sampleController);

export default router;
