import asyncHandler from "express-async-handler";
import db from "../../config/db.js";
import bcrypt from "bcrypt";

import * as service from "./transfer.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";
import sendObservationMail from "../admin/admin.service.js";
import { roles } from "../../utils/roles.js";

//transfer to external hospital
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

// get all transfered
export const getTransfered = asyncHandler(async (req, res) => {});

// update transfer
export const updateTransfer = asyncHandler(async (req, res) => {});
