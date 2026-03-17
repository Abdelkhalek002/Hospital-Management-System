import express from "express";
import * as controller from "../controllers/governorates.js";
import limiter from "../../../services/limitReqsMiddleware.js";
import {
  Protect,
  allowedToUser,
} from "../../../middlewares/auth.middleware.js";
import { roles } from "../../../utils/roles.js";

const router = express.Router();

router
  .route("/governorates")
  .get(controller.GetAllGovernorates)
  .post(Protect, limiter, controller.createGovernorate);

router
  .route("/governorates/:gov_id")
  .put(Protect, limiter, controller.updateGovernorate)
  .delete(Protect, limiter, controller.deleteGovernorate);

export default router;
