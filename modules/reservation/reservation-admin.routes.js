import express from "express";
const router = express.Router();

import * as reservationController from "./reservation.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

router.use(protect);

// Backward-compatible emergency listing
router
  .route("/emergency")
  .get(
    hasPermission(permissions.RESERVATIONS_READ),
    reservationController.adminGetAllEmergencyReservations,
  );

// Main reservations listing (supports ?page=&limit=&searchKey=&month=&year=&examType=&clinic_id=&status=) and creation
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

// Dedicated status route
router.route("/:id/status").put(
  hasPermission(permissions.RESERVATIONS_APPROVE),
  reservationController.isAccepted,
);

// Convert to transfer route (Counter)
router
  .route("/:id/transfer")
  .post(
    hasPermission(permissions.TRANSFERS_WRITE),
    reservationController.convertToTransfer,
  );

// Unified parameter route
router
  .route("/:id")
  .put(
    hasPermission(permissions.RESERVATIONS_WRITE),
    (req, res, next) => {
      // If only status is passed in body, route to isAccepted
      if (req.body.status !== undefined && Object.keys(req.body).length === 1) {
        return reservationController.isAccepted(req, res, next);
      }
      return reservationController.adminUpdateRequest(req, res, next);
    },
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
