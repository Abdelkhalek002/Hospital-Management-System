import express from "express";
const router = express.Router();

import * as adminController from "./admin.controller.js";

import {
  addNewAdminValidator,
  resetPasswordValidator,
  sendObservationValidator,
  addSuperAdminValidator,
} from "../../utils/validators/adminValidator.js";

import { Protect, allowedTo } from "../../middlewares/auth.middleware.js";
import limiter from "../../services/limitReqsMiddleware.js";
import { roles } from "../../utils/roles.js";

//Statistics
router
  .route("/statistics")
  .get(Protect, allowedTo(roles.SUPER_ADMIN), adminController.getStatistics);
router
  .route("/resbymonth")
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN),
    adminController.getReservationsByMonth,
  );

// ADMIN LOG ROUTERS
router
  .route("/logs")
  .get(Protect, allowedTo(roles.SUPER_ADMIN), adminController.getAdminLogs)
  .delete(Protect, allowedTo(roles.SUPER_ADMIN), adminController.clearHistory);

router
  .route("/logs/:admin_id")
  .get(adminController.getSpecificAdminLogs)
  .delete(adminController.clearSpecificHistory);

// GET ALL USER PROFILES
router
  .route("/userProfiles")
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.getAllUserProfiles,
  );

router
  .route("/userProfiles/:student_id")
  .put(adminController.updateUserProfile)
  .delete(adminController.deleteUserProfile);

router.patch(
  "/userProfiles/:student_id/block",
  Protect,
  allowedTo(roles.SUPER_ADMIN, roles.SECOND_MANAGER, roles.COUNTER),
  adminController.blockUser,
);
router.patch(
  "/userProfiles/:student_id/unblock",
  Protect,
  allowedTo(roles.SUPER_ADMIN, roles.SECOND_MANAGER, roles.COUNTER),
  adminController.unblockUser,
);

// ADMIN CRUD ROUTERS
router
  .route("/")
  .post(
    Protect,
    allowedTo(roles.SUPER_ADMIN),
    addNewAdminValidator,
    adminController.addNewAdmin,
  );

router
  .route("/add")
  .post(Protect, addSuperAdminValidator, adminController.addSuperAdmin);

router
  .route("/all")
  .get(Protect, allowedTo(roles.SUPER_ADMIN), adminController.getAllAdmin);

router
  .route("/:user_id")
  .get(adminController.viewAdmin)
  .put(Protect, allowedTo(roles.SUPER_ADMIN), adminController.updateAdmin)
  .patch(
    Protect,
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
//.delete(Protect, allowedTo(roles.SUPER_ADMIN), adminController.deleteAdmin);

router.get("/filter", adminController.filterStudents);

// SYSTEM FEATURES ROUTERS
// TODO: Add allowedTo(roles) to each route
router.route("/search").post(Protect, adminController.searchStudent);
router.route("/advancedSearch").post(Protect, adminController.advancedSearch);

// ADMIN MAIN ROUTERS
router
  .route("/acceptOrDecline/:id")
  .patch(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminController.acceptOrDecline,
  );
router
  .route("/transfer")
  .post(
    Protect,
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
    Protect,
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
    Protect,
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
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    sendObservationValidator,
    adminController.sendObservation,
  );

export default router;
