import express from "express";
const router = express.Router();

import {
  adminCreateRequest,
  adminUpdateRequest,
  adminViewRequest,
  adminDeleteRequest,
  adminGetAllReservations,
  adminGetAllEmergencyReservations,
} from "../controllers/AdminReservationController.js";

import { Protect, allowedTo } from "../middlewares/auth.middleware.js";
import { roles } from "../utils/roles.js";

router
  .route("/")
  .post(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminCreateRequest,
  )
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    adminGetAllReservations,
  );

router
  .route("/emergency")
  .get(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminGetAllEmergencyReservations,
  );
router
  .route("/:emergencyUser_id")
  .put(Protect, allowedTo(roles.SUPER_ADMIN, roles.COUNTER), adminUpdateRequest)
  .get(adminViewRequest)
  .delete(
    Protect,
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    adminDeleteRequest,
  );

export default router;
