import express from "express";
import {
  createFaculty,
  getAllFaculties,
  deleteFaculty,
  updateFaculty,
} from "../../controllers/systemDataControllers/facultyController.js";
import limiter from "../../services/limitReqsMiddleware.js";
import { Protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { Roles } from "../../utils/Roles.js";
import { facultyValidator } from "../../utils/validators/sysDataValidator.js";

const router = express.Router();

router
  .route("/faculties")
  .post(Protect, limiter, facultyValidator, createFaculty)
  .get(getAllFaculties);

router
  .route("/faculties/:faculty_id")
  .delete(Protect, limiter, deleteFaculty)
  .put(Protect, limiter, facultyValidator, updateFaculty);

export default router;
