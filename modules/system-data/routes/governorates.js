import express from "express";
import * as controller from "../controllers/governorates.js";
import limiter from "../../../services/rate-limit.service.js";
import {
  protect,
  restrictToUser,
} from "../../../middlewares/auth.middleware.js";
import { roles } from "../../../utils/roles.js";

const router = express.Router();

router
  .route("/governorates")
  .get(controller.GetAllGovernorates)
  .post(protect, limiter, controller.createGovernorate);

router
  .route("/governorates/:gov_id")
  .put(protect, limiter, controller.updateGovernorate)
  .delete(protect, limiter, controller.deleteGovernorate);

export default router;
