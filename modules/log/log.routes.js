import express from "express";
import * as controller from "./log.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

const router = express.Router();

// Protect all log endpoints
router.use(authMiddleware.protect);

router
  .route("/")
  .get(authMiddleware.hasPermission(permissions.LOGS_READ), controller.getLogs)
  .delete(
    authMiddleware.hasPermission(permissions.LOGS_DELETE),
    controller.deleteLogs,
  );

export default router;
