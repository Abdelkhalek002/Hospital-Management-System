import express from "express";

import transferRoute from "../transfer/transfer.route.js";
import reservationRoute from "../reservation/reservation-admin.routes.js";

import * as controller from "./admin.controller.js";

import { addNewAdminValidator } from "./admin.validator.js";

import * as authMiddleware from "../../middlewares/auth.middleware.js";
import limiter from "../../services/rate-limit.service.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

router.use(authMiddleware.protect);

router.route("/").post(controller.createOne).get(controller.getAll);

router
  .route("/:id")
  .get(controller.getOne)
  .patch(controller.updateOne)
  .delete(controller.deleteOne);

router.route("/logs").get(controller.getLogs).delete(controller.deleteAllLogs);

router.route(":id/logs").get(controller.getLog).delete(controller.deleteLog);

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

// Stats
router
  .route("/stats")
  .get(authMiddleware.allowedTo(roles.SECOND_MANAGER), controller.getStats);

export default router;
