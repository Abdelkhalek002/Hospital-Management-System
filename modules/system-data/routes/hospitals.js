import express from "express";
import * as controller from "../controllers/hospitals.js";
import { hospitalValidator } from "../validator.js";
import limiter from "../../../services/rate-limit.service.js";
import { protect, allowedTo } from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/hospitals")
  .post(protect, limiter, hospitalValidator, controller.createHospital)
  .get(controller.getAllhospitals);

router
  .route("/hospitals/:exHosp_id")
  .delete(protect, controller.deleteHospital)
  .put(protect, limiter, hospitalValidator, controller.updateHospital);

export default router;
