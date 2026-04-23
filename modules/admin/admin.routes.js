import express from "express";
const router = express.Router();

import transferRoute from "../transfer/transfer.route.js";

import * as adminController from "./admin.controller.js";

import {
  addNewAdminValidator,
  resetPasswordValidator,
  sendObservationValidator,
} from "./admin.validator.js";

import * as authMiddleware from "../../middlewares/auth.middleware.js";
import limiter from "../../services/rate-limit.service.js";
import { roles } from "../../utils/roles.js";

router.use(authMiddleware.protect);
router.use(authMiddleware.allowedToSuper);

// Transfer Route
router.use("/transfer", transferRoute);

//Statistics
router.route("/statistics").get(adminController.getStatistics);

router
  .route("/resbymonth")
  .get(
    authMiddleware.allowedTo(roles.SUPER_ADMIN),
    adminController.getReservationsByMonth,
  );

// GET ALL USER PROFILES
router
  .route("/userProfiles")
  .get(
    authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.getAllUserProfiles,
  );

router
  .route("/userProfiles/:student_id")
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

router
  .route("/:student_id")
  .post(
    authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    sendObservationValidator,
    adminController.sendObservation,
  );

export default router;
