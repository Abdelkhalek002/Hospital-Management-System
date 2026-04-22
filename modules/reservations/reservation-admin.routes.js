import express from "express";
const router = express.Router();

import * as reservationController from "./reservation.controller.js";

import { protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

router
  .route("/")
  .post(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminCreateRequest,
  )
  .get(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    reservationController.adminGetAllReservations,
  );

router
  .route("/emergency")
  .get(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminGetAllEmergencyReservations,
  );
router
  .route("/:emergencyUser_id")
  .put(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminUpdateRequest,
  )
  .get(reservationController.adminViewRequest)
  .delete(
    protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminDeleteRequest,
  );

export default router;
