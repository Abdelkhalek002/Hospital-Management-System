import express from "express";
import * as controller from "./system-data.controller.js";
import * as validator from "./system-data.validator.js";
import limiter from "../../services/rate-limit.service.js";
import { protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();
const adminRoles = [roles.SUPER_ADMIN, roles.SECOND_MANAGER];

// Clinics
router
  .route(["/clinics", "/clinics/"])
  .get(controller.getAllClinics)
  .post(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.clinicValidator,
    controller.createClinic,
  );

router
  .route(["/clinics/:id", "/clinics/:clinic_id"])
  .get(controller.getOneClinic)
  .put(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.clinicValidator,
    controller.updateClinic,
  )
  .delete(protect, allowedTo(...adminRoles), limiter, controller.deleteClinic);

// Faculties
router
  .route(["/faculties", "/faculties/"])
  .get(controller.getAllFaculties)
  .post(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.facultyValidator,
    controller.createFaculty,
  );

router
  .route(["/faculties/:id", "/faculties/:faculty_id"])
  .get(controller.getOneFaculty)
  .put(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.facultyValidator,
    controller.updateFaculty,
  )
  .delete(protect, allowedTo(...adminRoles), limiter, controller.deleteFaculty);

// Governorates
router
  .route(["/governorates", "/governorates/"])
  .get(controller.GetAllGovernorates)
  .post(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.governorateValidator,
    controller.createGovernorate,
  );

router
  .route(["/governorates/:id", "/governorates/:gov_id"])
  .get(controller.getOneGovernorate)
  .put(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.governorateValidator,
    controller.updateGovernorate,
  )
  .delete(
    protect,
    allowedTo(...adminRoles),
    limiter,
    controller.deleteGovernorate,
  );

// Hospitals
router
  .route(["/hospitals", "/hospitals/"])
  .get(controller.getAllhospitals)
  .post(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.hospitalValidator,
    controller.createHospital,
  );

router
  .route(["/hospitals/:id", "/hospitals/:exHosp_id"])
  .get(controller.getOneHospital)
  .put(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.hospitalValidator,
    controller.updateHospital,
  )
  .delete(protect, allowedTo(...adminRoles), limiter, controller.deleteHospital);

// Levels
router
  .route(["/levels", "/levels/"])
  .get(controller.GetAllLevels)
  .post(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.levelsValidator,
    controller.createLevel,
  );

router
  .route(["/levels/:id", "/levels/:level_id"])
  .get(controller.getOneLevel)
  .put(
    protect,
    allowedTo(...adminRoles),
    limiter,
    validator.levelsValidator,
    controller.updateLevel,
  )
  .delete(protect, allowedTo(...adminRoles), limiter, controller.DeleteLevel);

export default router;
