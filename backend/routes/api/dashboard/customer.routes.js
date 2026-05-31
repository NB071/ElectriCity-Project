import { Router } from "express";
import { customerController } from "../../../controllers/api/dashboard/index.js";

const router = Router();

router.get("/sample", customerController.sampleController);

export default router;
