import express from "express";
import * as controller from "../controllers/clinics.js";
import limiter from "../../../services/rate-limit.service.js";
import {
  protect,
  allowedTo,
  restrictToUser,
} from "../../../middlewares/auth.middleware.js";
import { clinicValidator } from "../validator.js";
import { roles } from "../../../utils/roles.js";

const router = express.Router();

router
  .route("/clinics")
  .post(protect, limiter, clinicValidator, controller.createClinic)
  .get(controller.getAllClinics);

router
  .route("/clinics/:clinic_id")
  .delete(protect, controller.deleteClinic)
  .put(protect, limiter, clinicValidator, controller.updateClinic);

export default router;
