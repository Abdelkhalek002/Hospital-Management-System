import LogRepository from "./log.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { AuditAction, AuditActionLabels } from "../../utils/audit-actions.js";
import { toLogResource } from "./log.resource.js";

const logRepo = () => new LogRepository();

export const getLogs = async ({
  page = 1,
  limit = 10,
  adminId = null,
  action = null,
  status = null,
  from = null,
  to = null,
} = {}) => {
  return await logRepo().findLogs({ page, limit, adminId, action, status, from, to });
};

export const getLogById = async (id) => {
  const log = await logRepo().findById(id);
  if (!log) {
    throw new ApiError("سجل النشاط غير موجود", StatusCode.NOT_FOUND);
  }
  return log;
};

export const getLog = async (adminId) => {
  return await logRepo().findByAdminId(adminId);
};

export const getLogActions = () => {
  return Object.keys(AuditAction).map((key) => {
    const actionCode = AuditAction[key];
    return {
      key,
      action: actionCode,
      label: AuditActionLabels[actionCode] || actionCode,
    };
  });
};

export const exportLogsAsCsv = async (filters = {}) => {
  const logs = await logRepo().findAllForExport(filters);
  const formattedLogs = logs.map((l) => toLogResource(l));

  // CSV Headers
  const headers = [
    "ID",
    "Admin ID",
    "Admin Name",
    "Action",
    "Description",
    "Entity Type",
    "Entity ID",
    "Status",
    "IP Address",
    "User Agent",
    "Created At",
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = formattedLogs.map((log) => [
    log.id,
    log.adminId || "",
    escapeCsv(log.adminName),
    escapeCsv(log.action),
    escapeCsv(log.method),
    escapeCsv(log.entityType),
    log.entityId || "",
    escapeCsv(log.status),
    escapeCsv(log.ipAddress),
    escapeCsv(log.userAgent),
    escapeCsv(log.createdAt),
  ].join(","));

  // Prepend UTF-8 BOM (\uFEFF) to guarantee Arabic text renders properly in Excel
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  return csvContent;
};

export const purgeOldLogs = async (retentionDays = 90) => {
  const days = Math.max(parseInt(retentionDays, 10) || 90, 1);
  return await logRepo().deleteOlderThanDays(days);
};
