import asyncHandler from "express-async-handler";
import { StatusCode } from "../../utils/status-codes.js";
import Base from "../../repositories/base.repository.js";
import * as service from "./admin.service.js";
import { logAction } from "../../utils/audit-log.js";
import { AuditAction } from "../../utils/audit-actions.js";
import { pick } from "../../utils/pick-from-body-request.js";
import {
  formatAdminPhotoUrl,
  toAdminResource,
  toAdminListResource,
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
  logAction(req, {
    action: AuditAction.ADMIN_CREATE,
    entityType: "admin",
    entityId: result.id,
    details: {
      username: result.username,
      email: result.email,
      role: result.role,
      status: result.status,
    },
  });

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
  logAction(req, {
    action: AuditAction.ADMIN_UPDATE,
    entityType: "admin",
    entityId: id,
    details: {
      updatedFields: Object.keys(data).filter((k) => k !== "password"),
      role: data.role,
      status: data.status,
    },
  });

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

  logAction(req, {
    action: AuditAction.ADMIN_DELETE,
    entityType: "admin",
    entityId: id,
  });

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم حذف الادمن بنجاح",
  });
});


//------------------------------STATS-----------------------------------------
export const getStats = asyncHandler(async (req, res) => {
  const result = await new Base().getStats();
  res.status(StatusCode.OK).json({
    msg: "success",
    data: result,
  });
});


