import express from "express";
const router = express.Router();

import * as adminController from "./admin.controller.js";

import {
  addNewAdminValidator,
  resetPasswordValidator,
  sendObservationValidator,
} from "./admin.validator.js";

import { protect, allowedTo } from "../../middlewares/auth.middleware.js";
import limiter from "../../services/rate-limit.service.js";
import { roles } from "../../utils/roles.js";

//Statistics
router.route("/statistics").get(adminController.getStatistics);

router
  .route("/resbymonth")
  .get(
    protect,
    allowedTo(roles.SUPER_ADMIN),
    adminController.getReservationsByMonth,
  );

// GET ALL USER PROFILES
router
  .route("/userProfiles")
  .get(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.getAllUserProfiles,
  );

router
  .route("/userProfiles/:student_id")
  .put(adminController.updateUserProfile)
  .delete(adminController.deleteUserProfile);

router
  .route("/:user_id")
  .patch(
    protect,
    allowedTo(
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
router.route("/search").post(protect, adminController.searchStudent);
router.route("/advancedSearch").post(protect, adminController.advancedSearch);

// ADMIN MAIN ROUTERS
router
  .route("/acceptOrDecline/:id")
  .patch(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.acceptOrDecline,
  );
router
  .route("/transfer")
  .post(
    protect,
    allowedTo(
      roles.TRANSFER_CLERK,
      roles.SUPER_ADMIN,
      roles.BADR_HOSPITAL_ADMIN,
    ),
    adminController.transfer,
  );

router
  .route("/transferdata")
  .post(
    protect,
    allowedTo(
      roles.SUPER_ADMIN,
      roles.BADR_HOSPITAL_ADMIN,
      roles.TRANSFER_CLERK,
    ),
    adminController.getTransfered,
  );
router
  .route("/transfer/:transfer_id")
  .put(
    protect,
    allowedTo(
      roles.TRANSFER_CLERK,
      roles.SUPER_ADMIN,
      roles.BADR_HOSPITAL_ADMIN,
    ),
    adminController.updateTransfer,
  );
router
  .route("/:student_id")
  .post(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    sendObservationValidator,
    adminController.sendObservation,
  );

export default router;
