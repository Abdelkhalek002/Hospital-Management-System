import express from "express";
import * as reservationController from "./reservation.controller.js";

// IMPORT VALIDATORS

import { Protect, allowedToUser } from "../../middlewares/auth.middleware.js";
import { createRequestValidator } from "./reservation.validator.js";

const router = express.Router();

router
  .route("/:student_id")
  .post(
    Protect,
    allowedToUser("user"),
    createRequestValidator,
    reservationController.createRequest,
  )
  .get(Protect, reservationController.getMyReservations);

router
  .route("/:student_id/:medicEx_id")
  .put(reservationController.updateRequest)
  .get(reservationController.viewRequest)
  .delete(reservationController.cancelRequest);

export default router;
