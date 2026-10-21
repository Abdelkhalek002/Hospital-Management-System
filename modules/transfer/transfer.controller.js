import asyncHandler from "express-async-handler";
import * as service from "./transfer.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { logAction } from "../../utils/audit-log.js";
import { AuditAction } from "../../utils/audit-actions.js";
import { pick } from "../../utils/pick-from-body-request.js";

import * as resource from "./transfer.resource.js";

// Step 1 (Counter): Initiate transfer / convert reservation to transfer
export const initiateTransfer = asyncHandler(async (req, res) => {
  const reservationId = req.params.id || req.body.reservation_id;
  const allowedFields = ["transfer_reason", "notes"];
  const data = pick(req.body, allowedFields);
  data.reservation_id = reservationId;

  const result = await service.initiateTransfer(data);

  logAction(req, {
    action: AuditAction.TRANSFER_INITIATE,
    entityType: "transfer",
    entityId: result?.id || result?.insertId || reservationId,
    details: { reservation_id: reservationId, transfer_reason: data.transfer_reason },
  });

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

  logAction(req, {
    action: AuditAction.TRANSFER_ASSIGN_HOSPITAL,
    entityType: "transfer",
    entityId: id,
    details: { hospital_id: data.hospital_id, notes: data.notes },
  });

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

  logAction(req, {
    action: AuditAction.TRANSFER_UPDATE,
    entityType: "transfer",
    entityId: id,
    details: data,
  });

  res.status(StatusCode.OK).json({ message: "تم تحديث بيانات طلب التحويل", data: result });
});
