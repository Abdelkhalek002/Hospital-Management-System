import express from "express";

import transferRoute from "../transfer/transfer.route.js";
import reservationRoute from "../reservation/reservation-admin.routes.js";

import * as controller from "./admin.controller.js";

import {
  addNewAdminValidator,
  updateAdminValidator,
} from "./admin.validator.js";

import * as authMiddleware from "../../middlewares/auth.middleware.js";
import * as fileUploader from "../../middlewares/file-upload.middleware.js";
import limiter from "../../services/rate-limit.service.js";
import { roles } from "../../utils/roles.js";

const router = express.Router();

router.use(
  authMiddleware.protect,
  authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.SECOND_MANAGER),
);

router
  .route("/")
  .post(
    fileUploader.uploadAdminPhoto,
    fileUploader.processAdminPhoto,
    addNewAdminValidator,
    controller.createOne,
  )
  .get(controller.getAll);

// Stats Route (specific endpoint before :id)
router
  .route("/stats")
  .get(
    authMiddleware.allowedTo(roles.SUPER_ADMIN, roles.SECOND_MANAGER),
    controller.getStats,
  );

// Logs Routes (specific endpoints before :id)
router.route("/logs").get(controller.getLogs).delete(controller.deleteLogs);
router
  .route("/:admin_id/logs")
  .get(controller.getLog)
  .delete(controller.deleteLog);

// Parameterized :id routes
router
  .route("/:id")
  .get(controller.getOne)
  .put(
    fileUploader.uploadAdminPhoto,
    fileUploader.processAdminPhoto,
    updateAdminValidator,
    controller.updateOne,
  )
  .patch(
    fileUploader.uploadAdminPhoto,
    fileUploader.processAdminPhoto,
    updateAdminValidator,
    controller.updateOne,
  )
  .delete(controller.deleteOne);

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

export default router;
