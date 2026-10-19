import express from "express";
const router = express.Router();

import * as controller from "../transfer/transfer.controller.js";
import { protect, hasPermission } from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

router.use(protect);

router
  .route("/")
  .get(hasPermission(permissions.TRANSFERS_READ), controller.getTransferred);

router
  .route("/initiate")
  .post(hasPermission(permissions.TRANSFERS_WRITE), controller.initiateTransfer);

router
  .route("/:id/assign-hospital")
  .put(hasPermission(permissions.TRANSFERS_WRITE), controller.assignHospital);

router
  .route("/:id")
  .get(hasPermission(permissions.TRANSFERS_READ), controller.getTransferById)
  .patch(hasPermission(permissions.TRANSFERS_WRITE), controller.updateTransfer);

export default router;
