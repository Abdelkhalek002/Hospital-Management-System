import express from "express";
import * as controller from "../controllers/faculties.js";
import limiter from "../../../services/rate-limit.service.js";
import { protect, allowedTo } from "../../../middlewares/auth.middleware.js";
import { roles } from "../../../utils/roles.js";
import { facultyValidator } from "../validator.js";

const router = express.Router();

router
  .route("/faculties")
  .post(protect, limiter, facultyValidator, controller.createFaculty)
  .get(controller.getAllFaculties);

router
  .route("/faculties/:faculty_id")
  .delete(protect, limiter, controller.deleteFaculty)
  .put(protect, limiter, facultyValidator, controller.updateFaculty);

export default router;
