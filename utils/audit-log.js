import EventEmitter from "events";
import LogRepository from "../modules/log/log.repository.js";
import { AuditActionLabels } from "./audit-actions.js";

const auditEmitter = new EventEmitter();

// Handle audit logging asynchronously in the background
auditEmitter.on("audit:record", async (payload) => {
  try {
    // If method is not provided, fallback to standard Arabic label or action name
    if (!payload.method) {
      payload.method =
        (payload.action && AuditActionLabels[payload.action]) ||
        payload.action ||
        "عملية إدارية";
    }

    await new LogRepository().createLog(payload);
  } catch (error) {
    console.error("❌ [AuditLog] Error recording audit log:", error?.message || error);
  }
});

/**
 * Record an audit log event asynchronously.
 * Does not block caller or HTTP response.
 *
 * @param {Object} data
 * @param {number} [data.adminId]
 * @param {string} [data.action]
 * @param {string} [data.entityType]
 * @param {number|string} [data.entityId]
 * @param {Object|string} [data.details]
 * @param {string} [data.ipAddress]
 * @param {string} [data.userAgent]
 * @param {string} [data.status="SUCCESS"]
 * @param {string} [data.method]
 */
export const recordAuditLog = (data = {}) => {
  auditEmitter.emit("audit:record", { ...data });
};

/**
 * Helper to log an action with Express req context (IP, User-Agent, user.id).
 *
 * @param {import("express").Request} req
 * @param {Object} options
 * @param {string} options.action Standardized action key from AuditAction
 * @param {string} [options.entityType]
 * @param {number|string} [options.entityId]
 * @param {Object} [options.details]
 * @param {string} [options.method] Explicit human-readable label (defaults to AuditActionLabels)
 * @param {string} [options.status="SUCCESS"]
 */
export const logAction = (req, options = {}) => {
  const adminId = req?.user?.id ?? req?.user?.admin_id ?? null;
  const ipAddress =
    req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
    req?.ip ||
    req?.socket?.remoteAddress ||
    null;
  const userAgent = req?.headers?.["user-agent"]
    ? String(req.headers["user-agent"]).substring(0, 255)
    : null;

  recordAuditLog({
    adminId,
    action: options.action,
    entityType: options.entityType,
    entityId: options.entityId,
    details: options.details,
    method: options.method,
    status: options.status || "SUCCESS",
    ipAddress,
    userAgent,
  });
};

/**
 * Backward-compatible auditLog function.
 * Accepts legacy `{ adminId, method, createdAt, ... }` format.
 */
export const auditLog = async (data) => {
  recordAuditLog(data);
};

export default {
  recordAuditLog,
  logAction,
  auditLog,
};
