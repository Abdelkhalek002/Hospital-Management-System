import asyncHandler from "express-async-handler";
import * as service from "./transfer.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";

import * as resource from "./transfer.resource.js";

// Step 1 (Counter): Initiate transfer / convert reservation to transfer
export const initiateTransfer = asyncHandler(async (req, res) => {
  const reservationId = req.params.id || req.body.reservation_id;
  const allowedFields = ["transfer_reason", "notes"];
  const data = pick(req.body, allowedFields);
  data.reservation_id = reservationId;

  const result = await service.initiateTransfer(data);

  const auditData = {
    adminId: req.user.id,
    method: "تحويل كشف طبي إلى قسم التحويلات الخارجية",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  return res.status(StatusCode.CREATED).json({
    message: "تم تحويل الكشف بنجاح إلى قسم التحويلات",
    data: result,
  });
});

// Step 2 (Transfer Clerk): Assign external hospital and notify student
export const assignHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowedFields = ["hospital_id", "notes"];
  const data = pick(req.body, allowedFields);

  const result = await service.assignHospital(id, data);

  const auditData = {
    adminId: req.user.id,
    method: "تحديد مستشفى خارجية وإرسال تفاصيل التحويل",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  return res.status(StatusCode.OK).json({
    message: "تم تحديد المستشفى الخارجية وإشعار الطالب بنجاح",
    data: resource.toTransferResource(result, req),
  });
});

// Get all transferred students (supports ?status=pending|completed, page, limit, searchKey)
export const getTransferred = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const searchKey = req.query.searchKey || "";
  const status = req.query.status || null;
  const result = await service.getTransferred({ page, limit, searchKey, status });
  return res.status(StatusCode.OK).json({
    data: resource.toTransfersListResource(result.data, req),
  });
});

// Get single transfer by ID
export const getTransferById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await service.getTransferById(id);
  return res.status(StatusCode.OK).json({
    data: resource.toTransferResource(result, req),
  });
});

// Update transfer
export const updateTransfer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowedFields = ["transfer_reason", "hospital_id", "notes", "status"];
  const data = pick(req.body, allowedFields);

  const result = await service.updateTransfer(id, data);

  const auditData = {
    adminId: req.user.id,
    method: "تحديث طلب تحويل لمستشفي خارجية",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  res.status(StatusCode.OK).json({ message: "تم تحديث بيانات طلب التحويل", data: result });
});
