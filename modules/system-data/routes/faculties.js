import express from "express";
import * as controller from "../controllers/faculties.js";
import limiter from "../../../shared/services/rate-limit.service.js";
import { Protect, allowedTo } from "../../../middlewares/auth.middleware.js";
import { roles } from "../../../utils/roles.js";
import { facultyValidator } from "../validator.js";

const router = express.Router();

router
  .route("/faculties")
  .post(Protect, limiter, facultyValidator, controller.createFaculty)
  .get(controller.getAllFaculties);

router
  .route("/faculties/:faculty_id")
  .delete(Protect, limiter, controller.deleteFaculty)
  .put(Protect, limiter, facultyValidator, controller.updateFaculty);

export default router;
