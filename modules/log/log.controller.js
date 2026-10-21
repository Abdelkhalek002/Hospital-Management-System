import asyncHandler from "express-async-handler";
import * as service from "./log.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { toLogResource, toLogListResource } from "./log.resource.js";

export const getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const action = req.query.action || null;
  const status = req.query.status || null;
  const adminId = req.query.adminId || req.query.admin_id || null;
  const from = req.query.from || null;
  const to = req.query.to || null;

  const result = await service.getLogs({ page, limit, action, status, adminId, from, to });
  const formattedLogs = toLogListResource(result.adminLogs);

  return res.status(StatusCode.OK).json({
    status: "success",
    data: formattedLogs,
  });
});

export const getLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await service.getLogById(id);
  const formatted = toLogResource(log);

  return res.status(StatusCode.OK).json({
    status: "success",
    data: formatted,
  });
});

export const getLogActions = asyncHandler(async (req, res) => {
  const actions = service.getLogActions();
  return res.status(StatusCode.OK).json({
    status: "success",
    results: actions.length,
    data: actions,
  });
});

export const exportLogs = asyncHandler(async (req, res) => {
  const action = req.query.action || null;
  const status = req.query.status || null;
  const adminId = req.query.adminId || req.query.admin_id || null;
  const from = req.query.from || null;
  const to = req.query.to || null;

  const csvData = await service.exportLogsAsCsv({ action, status, adminId, from, to });
  const filename = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  return res.status(StatusCode.OK).send(csvData);
});
