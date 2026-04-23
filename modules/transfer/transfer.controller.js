import asyncHandler from "express-async-handler";
import db from "../../config/db.js";
import bcrypt from "bcrypt";

import * as service from "./transfer.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";
import sendObservationMail from "../admin/admin.service.js";
import { roles } from "../../utils/roles.js";

// transfer to external hospital
export const transfer = asyncHandler(async (req, res) => {
  // 1. pick valid data only from req.body
  const allowedFields = [
    "student_id",
    "medical_exam_id",
    "hospital_id",
    "transfer_reason",
    "notes",
  ];
  const data = pick(req.body, allowedFields);

  // 2. do the transfer
  const result = await service.transfer(data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "تحويل طالب لمستشفي خارجية",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  // 4. send response
  res.status(StatusCode.OK).json({ message: "تم التحويل بنجاح" });
});

// get all transferred students
export const getTransferred = asyncHandler(async (req, res) => {
  // 1. get page, limit, searchKey from req.query
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const searchKey = req.query.searchKey || "";

  // 2. call the service
  const result = await service.getTransferred({ page, limit, searchKey });
  if (!result.totalCount) {
    return res
      .status(StatusCode.NOT_FOUND)
      .json({ msg: "No examinations found" });
  }

  // 3. send response
  return res.status(StatusCode.OK).json({
    totalPages: result.totalPages,
    currentPage: page,
    data: result.data,
  });
});

// update transfer
export const updateTransfer = asyncHandler(async (req, res) => {
  // 1. get data from request
  const { id } = req.params;
  const allowedFields = ["transfer_reason", "hospital_id", "notes"];
  const data = pick(req.body, allowedFields);

  // 2. call service
  const result = await service.updateTransfer(id, data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "تحديث طلب تحويل لمستشفي خارجية",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  // 4. send response
  res.status(StatusCode.OK).json({ message: "تم تحديث بيانات طلب التحويل" });
});
