import express from "express";
const router = express.Router();

import * as controller from "../transfer/transfer.controller.js";
import { hasPermission } from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

router
  .route("/")
  .post(hasPermission(permissions.TRANSFERS_WRITE), controller.transfer)
  .get(hasPermission(permissions.TRANSFERS_READ), controller.getTransferred);

router
  .route("/:id")
  .patch(hasPermission(permissions.TRANSFERS_WRITE), controller.updateTransfer);

export default router;

