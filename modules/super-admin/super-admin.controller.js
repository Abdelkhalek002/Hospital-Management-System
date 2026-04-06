import asyncHandler from "express-async-handler";
import * as superAdminService from "./super-admin.service.js";
import { StatusCode } from "../../utils/status-codes.js";

export const createSuperAdmin = asyncHandler(async (req, res) => {
  // 1. pick valid data only from req.body
  const allowedFields = ["username", "email", "password"];
  const pick = (obj, fields) =>
    fields.reduce((acc, field) => {
      if (obj[field] !== undefined) acc[field] = obj[field];
      return acc;
    }, {});
  const data = pick(req.body, allowedFields);

  // 2. create super admin
  await superAdminService.addOne(data);
  // 3. send response
  return res.status(StatusCode.CREATED).json({
    status: "success",
    message: "تم إضافة مدير نظام جديد",
  });
});
