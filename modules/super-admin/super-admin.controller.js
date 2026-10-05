import asyncHandler from "express-async-handler";
import * as superAdminService from "./super-admin.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";

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
  const { id } = req.params;
  const result = await superAdminService.getOne(id);

  return res.status(StatusCode.OK).json({
    status: "success",
    data: result,
  });
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await superAdminService.getAll();

  return res.status(StatusCode.OK).json({
    status: "success",
    data: result,
  });
});

export const updateOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowedFields = ["username", "email", "password"];
  const data = pick(req.body, allowedFields);

  await superAdminService.updateOne(id, data);

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم تعديل بيانات مدير النظام بنجاح",
  });
});

export const deleteOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await superAdminService.deleteOne(id);

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم حذف مدير النظام بنجاح",
    data: result,
  });
});
