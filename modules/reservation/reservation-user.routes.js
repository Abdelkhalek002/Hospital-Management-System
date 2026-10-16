import express from "express";
import * as reservationController from "./reservation.controller.js";

// IMPORT VALIDATORS

import {
  protect,
  restrictToUser,
  requireApprovedUser,
} from "../../middlewares/auth.middleware.js";
import { createRequestValidator } from "./reservation.validator.js";

const router = express.Router();

router.use(protect, restrictToUser, requireApprovedUser);

router
  .route("/")
  .post(
    createRequestValidator,
    reservationController.createRequest,
  )
  .get(reservationController.getMyReservations);

router
  .route("/:student_id/:medicEx_id")
  .put(reservationController.updateRequest)
  .get(reservationController.viewRequest)
  .delete(reservationController.cancelRequest);

export default router;
