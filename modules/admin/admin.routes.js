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

// Transfer Route
router.use(
  "/transfers",
  authMiddleware.allowedTo(
    roles.SECOND_MANAGER,
    roles.TRANSFER_CLERK,
    roles.COUNTER,
  ),
  transferRoute,
);

// Reservation Route
router.use(
  "/reservations",
  authMiddleware.allowedTo(
    roles.SECOND_MANAGER,
    roles.MEDICAL_CHECK_MANAGER,
    roles.COUNTER,
  ),
  reservationRoute,
);

// Statistics
router
  .route("/stats")
  .get(
    authMiddleware.allowedTo(roles.SECOND_MANAGER),
    adminController.getStatistics,
  );

router.get("/filter", adminController.filterStudents);

// SYSTEM FEATURES ROUTERS
router.route("/search").post(adminController.searchStudent);
router.route("/advancedSearch").post(adminController.advancedSearch);

export default router;
