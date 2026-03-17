import express from "express";
const router = express.Router();

import * as reservationController from "./reservation.controller.js";

import { Protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

router
  .route("/")
  .post(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminCreateRequest,
  )
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    reservationController.adminGetAllReservations,
  );

router
  .route("/emergency")
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminGetAllEmergencyReservations,
  );
router
  .route("/:emergencyUser_id")
  .put(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminUpdateRequest,
  )
  .get(reservationController.adminViewRequest)
  .delete(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminDeleteRequest,
  );

export default router;
