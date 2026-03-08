import express from "express";
import {
  createGovernorate,
  deleteGovernorate,
  updateGovernorate,
  GetAllGovernorates,
} from "../../controllers/systemDataControllers/govsController.js";
import limiter from "../../services/limitReqsMiddleware.js";
import { Protect, allowedToUser } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

router
  .route("/governorates")
  .get(GetAllGovernorates)
  .post(Protect, limiter, createGovernorate);

router
  .route("/governorates/:gov_id")
  .put(Protect, limiter, updateGovernorate)
  .delete(Protect, limiter, deleteGovernorate);

export default router;
