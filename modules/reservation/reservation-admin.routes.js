import express from "express";
const router = express.Router();

import * as reservationController from "./reservation.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

router.use(protect);

router.get(
  "/byMonth",
  hasPermission(permissions.RESERVATIONS_READ),
  reservationController.getReservationsPerMonth,
);

router.route("/:id").put(
  hasPermission(permissions.RESERVATIONS_APPROVE),
  reservationController.isAccepted,
);

router
  .route("/")
  .post(
    hasPermission(permissions.RESERVATIONS_WRITE),
    reservationController.adminCreateRequest,
  )
  .get(
    hasPermission(permissions.RESERVATIONS_READ),
    reservationController.adminGetAllReservations,
  );

router
  .route("/emergency")
  .get(
    hasPermission(permissions.RESERVATIONS_READ),
    reservationController.adminGetAllEmergencyReservations,
  );

router
  .route("/:emergencyUser_id")
  .put(
    hasPermission(permissions.RESERVATIONS_WRITE),
    reservationController.adminUpdateRequest,
  )
  .get(
    hasPermission(permissions.RESERVATIONS_READ),
    reservationController.adminViewRequest,
  )
  .delete(
    hasPermission(permissions.RESERVATIONS_WRITE),
    reservationController.adminDeleteRequest,
  );

export default router;

