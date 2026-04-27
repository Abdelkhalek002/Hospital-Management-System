import express from "express";
import * as controller from "../controllers/levels.js";
import limiter from "../../../services/rate-limit.service.js";
import { protect, allowedTo } from "../../../middlewares/auth.middleware.js";
import { levelsValidator } from "../validator.js";
import { roles } from "../../../utils/roles.js";

const router = express.Router();

router
  .route("/levels")
  .post(protect, limiter, controller.createLevel)
  .get(controller.GetAllLevels);

router
  .route("/levels/:level_id")
  .delete(protect, limiter, controller.DeleteLevel)
  .put(protect, limiter, levelsValidator, controller.updateLevel);

export default router;
