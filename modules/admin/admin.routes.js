import express from "express";

import transferRoute from "../transfer/transfer.route.js";
import reservationRoute from "../reservation/reservation-admin.routes.js";

import * as adminController from "./admin.controller.js";

import { addNewAdminValidator } from "./admin.validator.js";

import * as authMiddleware from "../../middlewares/auth.middleware.js";
import limiter from "../../services/rate-limit.service.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.allowedToSuper);

// Transfer Route
router.use("/transfers", transferRoute);

// Reservation Route
router.use("/reservations", reservationRoute);

// Statistics
router.route("/stats").get(adminController.getStatistics);

// GET ALL USER PROFILES
router
  .route("/users")
  .get(
    authMiddleware.allowedTo(roles.COUNTER),
    adminController.getAllUserProfiles,
  );

router
  .route("/users/:student_id")
  .put(adminController.updateUserProfile)
  .delete(adminController.deleteUserProfile);

router.get("/filter", adminController.filterStudents);

// SYSTEM FEATURES ROUTERS
router.route("/search").post(adminController.searchStudent);
router.route("/advancedSearch").post(adminController.advancedSearch);

export default router;
