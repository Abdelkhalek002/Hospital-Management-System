import express from "express";
import * as controller from "../controllers/hospitals.js";
import { hospitalValidator } from "../validator.js";
import limiter from "../../../services/rate-limit.service.js";
import { Protect, allowedTo } from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/hospitals")
  .post(Protect, limiter, hospitalValidator, controller.createHospital)
  .get(controller.getAllhospitals);

router
  .route("/hospitals/:exHosp_id")
  .delete(Protect, controller.deleteHospital)
  .put(Protect, limiter, hospitalValidator, controller.updateHospital);

export default router;
