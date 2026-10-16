import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import Base from "../../repositories/base.repository.js";
import * as service from "./admin.service.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";
import {
  formatAdminPhotoUrl,
  toAdminResource,
  toAdminListResource,
  toAdminLogListResource,
} from "./admin.resource.js";

// Re-export helper for backward compatibility
export const getAdminPhotoUrl = (req, photo) => formatAdminPhotoUrl(photo, req);

export const createOne = asyncHandler(async (req, res) => {
  // 1. pick valid data from req.body (handling username / userName / name)
  const username = req.body.username || req.body.userName || req.body.name;
  const { email, password, role, profile_photo, status } = req.body;

  const data = {
    username,
    email,
    password,
    role,
    status: status || "active",
    profile_photo_path: profile_photo || null,
  };

  // 2. create admin
  const result = await service.createOne(data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "اضافة ادمن جديد",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  const formattedAdmin = toAdminResource(result, req);

  // 4. send response
  return res.status(StatusCode.CREATED).json({
    status: "success",
    message: `تم إضافة أدمن جديد`,
    data: formattedAdmin,
  });
});

export const updateOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const username = req.body.username || req.body.userName || req.body.name;
  const allowedFields = [
    "email",
    "role",
    "status",
    "password",
  ];
  const data = pick(req.body, allowedFields);
  if (username) data.username = username;
  if (req.body.profile_photo !== undefined) {
    data.profile_photo_path = req.body.profile_photo;
  }


  // 2. update admin
  const result = await service.updateOne(id, data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "تعديل بيانات أدمن",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  const formattedAdmin = toAdminResource(result, req);

  // 4. send response
  return res.status(StatusCode.OK).json({
    status: "success",
    message: `تم تعديل بيانات الأدمن بنجاح`,
    data: formattedAdmin,
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await service.getOne(id);

  const formattedAdmin = toAdminResource(result, req);

  return res.status(StatusCode.OK).json({
    status: "success",
    data: formattedAdmin,
  });
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll();
  const formattedAdmins = toAdminListResource(result, req);

  return res.status(StatusCode.OK).json({
    status: "success",
    results: formattedAdmins.length,
    data: formattedAdmins,
  });
});

export const deleteOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAdmin = await service.deleteOne(id);

  await auditLog({
    adminId: req.user.id,
    method: "حذف ادمن",
    createdAt: new Date().toISOString(),
  });

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم حذف الادمن بنجاح",
  });
});

//--------------------------------LOGS-------------------------------------
export const getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await service.getLogs({ page, limit });

  return res.status(StatusCode.OK).json({
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    adminLogs: toAdminLogListResource(result.adminLogs),
  });
});

export const getLog = asyncHandler(async (req, res) => {
  const adminId = req.params.admin_id || req.params.id;
  const result = await service.getLog(adminId);
  return res.status(StatusCode.OK).json(toAdminLogListResource(result));
});

export const deleteLogs = asyncHandler(async (req, res) => {
  await service.deleteLogs();
  return res.status(StatusCode.OK).json({ message: "تم حذف العمليات المسجلة" });
});

export const deleteLog = asyncHandler(async (req, res) => {
  const adminId = req.params.admin_id || req.params.id;
  await service.deleteLog(adminId);
  return res.status(StatusCode.OK).json({ message: "تم حذف العمليات المسجلة" });
});

//------------------------------STATS-----------------------------------------
export const getStats = asyncHandler(async (req, res) => {
  const result = await new Base().getStats();
  res.status(StatusCode.OK).json({
    msg: "success",
    data: result,
  });
});
