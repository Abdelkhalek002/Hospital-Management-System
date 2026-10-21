import express from "express";
import * as controller from "./log.controller.js";
import * as authMiddleware from "../../middlewares/auth.middleware.js";
import { permissions } from "../../utils/permissions.js";

const router = express.Router();

// Protect all log endpoints
router.use(authMiddleware.protect);

// 1. List logs (supports ?admin_id=, ?action=, ?status=, ?from=, ?to=, ?page=, ?limit=)
router
  .route("/")
  .get(authMiddleware.hasPermission(permissions.LOGS_READ), controller.getLogs);

// 2. Action types catalog (for frontend filter dropdowns)
router
  .route("/actions")
  .get(authMiddleware.hasPermission(permissions.LOGS_READ), controller.getLogActions);

// 3. Export logs to CSV
router
  .route("/export")
  .get(authMiddleware.hasPermission(permissions.LOGS_READ), controller.exportLogs);

// 4. Single log entry details by ID
router
  .route("/:id")
  .get(authMiddleware.hasPermission(permissions.LOGS_READ), controller.getLogById);

export default router;
