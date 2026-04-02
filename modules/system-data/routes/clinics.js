import express from "express";
import * as controller from "../controllers/clinics.js";
import limiter from "../../../services/rate-limit.service.js";
import {
  Protect,
  allowedTo,
  allowedToUser,
} from "../../../middlewares/auth.middleware.js";
import { clinicValidator } from "../validator.js";
import { roles } from "../../../utils/roles.js";

const router = express.Router();

router
  .route("/clinics")
  .post(Protect, limiter, clinicValidator, controller.createClinic)
  .get(controller.getAllClinics);

router
  .route("/clinics/:clinic_id")
  .delete(Protect, controller.deleteClinic)
  .put(Protect, limiter, clinicValidator, controller.updateClinic);

export default router;
