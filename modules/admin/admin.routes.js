import express from "express";

import transferRoute from "../transfer/transfer.route.js";
import reservationRoute from "../reservation/reservation-admin.routes.js";

import * as adminController from "./admin.controller.js";

import {
  addNewAdminValidator,
  resetPasswordValidator,
} from "./admin.validator.js";

import * as authMiddleware from "../../middlewares/auth.middleware.js";
import limiter from "../../services/rate-limit.service.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.allowedToSuper);

// Transfer Route
router.use("/transfer", transferRoute);

// Reservation Route
router.use("/reservations", reservationRoute);

// Statistics
router.route("/stats").get(adminController.getStatistics);

// GET ALL USER PROFILES
router
  .route("/users")
  .get(
    authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.getAllUserProfiles,
  );

router
  .route("/users/:student_id")
  .put(adminController.updateUserProfile)
  .delete(adminController.deleteUserProfile);

router
  .route("/:user_id")
  .patch(
    authMiddleware.allowedTo(
      roles.COUNTER,
      roles.TRANSFER_CLERK,
      roles.BADR_HOSPITAL_ADMIN,
      roles.OBSERVER,
      roles.SECOND_MANAGER,
    ),
    resetPasswordValidator,
    adminController.resetPassword,
  );

router.get("/filter", adminController.filterStudents);

// SYSTEM FEATURES ROUTERS
// TODO: Add allowedTo(roles) to each route
router.route("/search").post(adminController.searchStudent);
router.route("/advancedSearch").post(adminController.advancedSearch);

// ADMIN MAIN ROUTERS
router
  .route("/acceptOrDecline/:id")
  .patch(
    authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.acceptOrDecline,
  );

export default router;
