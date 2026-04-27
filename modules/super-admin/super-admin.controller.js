import asyncHandler from "express-async-handler";
//import * as service from "./super-admin.service.js";
import { auditLog } from "../../utils/audit-log.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";
import jwt from "jsonwebtoken";

export const createOne = asyncHandler(async (req, res) => {
  // 1. pick valid data only from req.body
  const allowedFields = ["username", "email", "password"];
  const data = pick(req.body, allowedFields);

  // 2. create super admin
  await superAdminService.addOne(data);
  // 3. send response
  return res.status(StatusCode.CREATED).json({
    status: "success",
    message: "تم إضافة مدير نظام جديد",
  });
});

export const getOne = asyncHandler(async (req, res) => {
  //
});
export const getAll = asyncHandler(async (req, res) => {
  //
});
export const updateOne = asyncHandler(async (req, res) => {
  //
});
export const deleteOne = asyncHandler(async (req, res) => {
  //
});
