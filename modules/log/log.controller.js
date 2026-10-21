import asyncHandler from "express-async-handler";
import * as service from "./log.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { toLogListResource } from "./log.resource.js";

export const getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const action = req.query.action || null;
  const status = req.query.status || null;
  const adminId = req.query.adminId || req.query.admin_id || null;

  const result = await service.getLogs({ page, limit, action, status, adminId });
  const formattedLogs = toLogListResource(result.adminLogs);

  return res.status(StatusCode.OK).json({
    status: "success",
    data: formattedLogs,
  });
});

export const getLog = asyncHandler(async (req, res) => {
  const adminId = req.params.admin_id || req.params.id;
  const result = await service.getLog(adminId);
  const formattedLogs = toLogListResource(result);

  return res.status(StatusCode.OK).json({
    status: "success",
    results: formattedLogs.length,
    data: formattedLogs,
  });
});

export const deleteLogs = asyncHandler(async (req, res) => {
  await service.deleteLogs();
  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم حذف العمليات المسجلة بنجاح",
  });
});

export const deleteLog = asyncHandler(async (req, res) => {
  const adminId = req.params.admin_id || req.params.id;
  await service.deleteLog(adminId);
  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم حذف العمليات المسجلة بنجاح",
  });
});
