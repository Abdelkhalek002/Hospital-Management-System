import express from "express";
import * as reservationController from "./reservation.controller.js";
import {
  protect,
  restrictToUser,
  requireApprovedUser,
} from "../../middlewares/auth.middleware.js";
import { createRequestValidator } from "./reservation.validator.js";

const router = express.Router();

router.use(protect, restrictToUser);

router
  .route("/")
  .post(
    requireApprovedUser,
    createRequestValidator,
    reservationController.createRequest,
  )
  .get(reservationController.getMyReservations);

router
  .route("/:student_id/:medicEx_id")
  .put(requireApprovedUser, reservationController.updateRequest)
  .get(requireApprovedUser, reservationController.viewRequest)
  .delete(requireApprovedUser, reservationController.cancelRequest);

export default router;
