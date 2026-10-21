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
import { permissions } from "../../utils/permissions.js";

const router = express.Router();

// Protect all admin endpoints (requires logged-in account)
router.use(authMiddleware.protect);

router
  .route("/")
  .post(
    authMiddleware.hasPermission(permissions.ADMINS_CREATE),
    fileUploader.uploadAdminPhoto,
    fileUploader.processAdminPhoto,
    addNewAdminValidator,
    controller.createOne,
  )
  .get(
    authMiddleware.hasPermission(permissions.ADMINS_READ),
    controller.getAll,
  );

// Stats Route (specific endpoint before :id)
router
  .route("/stats")
  .get(authMiddleware.hasPermission(permissions.STATS_READ), controller.getStats);



// Parameterized :id routes (admins manage their own account, or Super Admin manages anyone)
router
  .route("/:id")
  .get(authMiddleware.isOwnerOrAdmin("id"), controller.getOne)
  .put(
    authMiddleware.isOwnerOrAdmin("id"),
    fileUploader.uploadAdminPhoto,
    fileUploader.processAdminPhoto,
    updateAdminValidator,
    controller.updateOne,
  )

  .patch(
    authMiddleware.isOwnerOrAdmin("id"),
    fileUploader.uploadAdminPhoto,
    fileUploader.processAdminPhoto,
    updateAdminValidator,
    controller.updateOne,
  )
  .delete(
    authMiddleware.hasPermission(permissions.ADMINS_DELETE),
    controller.deleteOne,
  );

// Transfer Route
router.use(
  "/transfers",
  authMiddleware.hasPermission(permissions.TRANSFERS_READ),
  transferRoute,
);

// Reservation Route
router.use(
  "/reservations",
  authMiddleware.hasPermission(permissions.RESERVATIONS_READ),
  reservationRoute,
);

export default router;

