import express from "express";
const router = express.Router();

import {
  addNewAdmin,
  getAllAdmin,
  viewAdmin,
  updateAdmin,
  deleteAdmin,
  sendObservation,
  acceptOrDecline,
  resetPassword,
  getAdminLogs,
  getSpecificAdminLogs,
  clearHistory,
  clearSpecificHistory,
  searchStudent,
  advancedSearch,
  filterStudents,
  transfer,
  addSuperAdmin,
  getAllUserProfiles,
  deleteUserProfile,
  updateUserProfile,
  blockUser,
  unblockUser,
  updateTransfer,
  getStatistics,
  getReservationsByMonth,
  getTransfered,
} from "../controllers/adminController.js";

import {
  addNewAdminValidator,
  resetPasswordValidator,
  sendObservationValidator,
  addSuperAdminValidator,
} from "../utils/validators/adminValidator.js";

import { Protect, allowedTo } from "../middlewares/auth.middleware.js";
import limiter from "../services/limitReqsMiddleware.js";
import { roles } from "../utils/roles.js";

//Statistics
router
  .route("/statistics")
  .get(Protect, allowedTo(roles.SUPER_ADMIN), getStatistics);
router
  .route("/resbymonth")
  .get(Protect, allowedTo(roles.SUPER_ADMIN), getReservationsByMonth);

// ADMIN LOG ROUTERS
router
  .route("/logs")
  .get(Protect, allowedTo(roles.SUPER_ADMIN), getAdminLogs)
  .delete(Protect, allowedTo(roles.SUPER_ADMIN), clearHistory);

router
  .route("/logs/:admin_id")
  .get(getSpecificAdminLogs)
  .delete(clearSpecificHistory);

// GET ALL USER PROFILES
router
  .route("/userProfiles")
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    getAllUserProfiles,
  );

router
  .route("/userProfiles/:student_id")
  .put(updateUserProfile)
  .delete(deleteUserProfile);

router.patch(
  "/userProfiles/:student_id/block",
  Protect,
  allowedTo(roles.SUPER_ADMIN, roles.SECOND_MANAGER, roles.COUNTER),
  blockUser,
);
router.patch(
  "/userProfiles/:student_id/unblock",
  Protect,
  allowedTo(roles.SUPER_ADMIN, roles.SECOND_MANAGER, roles.COUNTER),
  unblockUser,
);

// ADMIN CRUD ROUTERS
router
  .route("/")
  .post(
    Protect,
    allowedTo(roles.SUPER_ADMIN),
    addNewAdminValidator,
    addNewAdmin,
  );

router.route("/add").post(Protect, addSuperAdminValidator, addSuperAdmin);

router.route("/all").get(Protect, allowedTo(roles.SUPER_ADMIN), getAllAdmin);

router
  .route("/:user_id")
  .get(viewAdmin)
  .put(Protect, allowedTo(roles.SUPER_ADMIN), updateAdmin)
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
    resetPassword,
  )
  .delete(Protect, allowedTo(roles.SUPER_ADMIN), deleteAdmin);

router.get("/filter", filterStudents);

// SYSTEM FEATURES ROUTERS
// TODO: Add allowedTo(roles) to each route
router.route("/search").post(Protect, searchStudent);
router.route("/advancedSearch").post(Protect, advancedSearch);

// ADMIN MAIN ROUTERS
router
  .route("/acceptOrDecline/:id")
  .patch(Protect, allowedTo(roles.SUPER_ADMIN, roles.COUNTER), acceptOrDecline);
router
  .route("/transfer")
  .post(
    Protect,
    allowedTo(
      roles.TRANSFER_CLERK,
      roles.SUPER_ADMIN,
      roles.BADR_HOSPITAL_ADMIN,
    ),
    transfer,
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
    getTransfered,
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
    updateTransfer,
  );
router
  .route("/:student_id")
  .post(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    sendObservationValidator,
    sendObservation,
  );

export default router;
