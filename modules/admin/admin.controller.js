import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import Base from "../../repositories/base.repository.js";
import * as service from "./admin.service.js";
import { auditLog } from "../../utils/audit-log.js";
import { pick } from "../../utils/pick-from-body-request.js";

const getAdminPhotoUrl = (req, photo) => {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }
  return `${req.protocol}://${req.get("host")}/api/v1/uploads/admins/${photo}`;
};

export const createOne = asyncHandler(async (req, res) => {
  // 1. pick valid data from req.body (handling username / userName / name)
  const username = req.body.username || req.body.userName || req.body.name;
  const { email, password, role, profile_photo } = req.body;

  const data = {
    username,
    email,
    password,
    role,
    profile_photo,
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

  const formattedAdmin = {
    ...result,
    profile_photo_url: getAdminPhotoUrl(req, result.profile_photo),
  };

  // 4. send response
  return res.status(StatusCode.CREATED).json({
    status: "success",
    message: `تم إضافة أدمن جديد`,
    data: formattedAdmin,
    admin: formattedAdmin,
  });
});

export const updateOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const username = req.body.username || req.body.userName || req.body.name;
  const allowedFields = [
    "email",
    "role",
    "is_active",
    "password",
    "profile_photo",
  ];
  const data = pick(req.body, allowedFields);
  if (username) data.username = username;

  // 2. update admin
  const result = await service.updateOne(id, data);

  // 3. record action
  const auditData = {
    adminId: req.user.id,
    method: "تعديل بيانات أدمن",
    createdAt: new Date().toISOString(),
  };
  await auditLog(auditData);

  const formattedAdmin = {
    ...result,
    profile_photo_url: getAdminPhotoUrl(req, result.profile_photo),
  };

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

  const formattedAdmin = {
    ...result,
    profile_photo_url: getAdminPhotoUrl(req, result.profile_photo),
  };

  return res.status(StatusCode.OK).json({
    status: "success",
    data: formattedAdmin,
  });
});

export const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll();

  const formattedAdmins = result.map((admin) => ({
    ...admin,
    profile_photo_url: getAdminPhotoUrl(req, admin.profile_photo),
  }));

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
    data: deletedAdmin,
  });
});

//--------------------------------LOGS-------------------------------------
export const getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await service.getLogs({ page, limit });

  return res.status(StatusCode.OK).json(result);
});

export const getLog = asyncHandler(async (req, res) => {
  const adminId = req.params.admin_id || req.params.id;
  const result = await service.getLog(adminId);
  return res.status(StatusCode.OK).json(result);
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
