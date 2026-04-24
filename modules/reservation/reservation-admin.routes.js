import express from "express";
const router = express.Router();

import * as reservationController from "./reservation.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";

import { protect, allowedTo } from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

router.use(authMiddleware.protect);
router.use(authMiddleware.allowedToSuper);

router.get("/byMonth", reservationController.getReservationsPerMonth);

router.route("/accept/:id").patch(
  //authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
  reservationController.isAccepted,
);

router
  .route("/")
  .post(
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminCreateRequest,
  )
  .get(
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER, roles.OBSERVER),
    reservationController.adminGetAllReservations,
  );

router
  .route("/emergency")
  .get(
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminGetAllEmergencyReservations,
  );
router
  .route("/:emergencyUser_id")
  .put(
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminUpdateRequest,
  )
  .get(reservationController.adminViewRequest)
  .delete(
    allowedTo(roles.SUPER_ADMIN, roles.COUNTER),
    reservationController.adminDeleteRequest,
  );

export default router;
