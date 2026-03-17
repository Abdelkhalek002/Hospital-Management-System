import express from "express";
import * as controller from "../controllers/levels.js";
import limiter from "../../../services/limitReqsMiddleware.js";
import { Protect, allowedTo } from "../../../middlewares/auth.middleware.js";
import { levelsValidator } from "../validator.js";
import { roles } from "../../../utils/roles.js";

const router = express.Router();

router
  .route("/levels")
  .post(Protect, limiter, controller.createLevel)
  .get(controller.GetAllLevels);

router
  .route("/levels/:level_id")
  .delete(Protect, limiter, controller.DeleteLevel)
  .put(Protect, limiter, levelsValidator, controller.updateLevel);

export default router;
