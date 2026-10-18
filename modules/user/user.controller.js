import asyncHandler from "express-async-handler";
import * as service from "./user.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";
import ApiError from "../../utils/api-error.js";
import {
  toUserProfileResource,
  toAdminUserResource,
  toAdminUserListItemResource,
  toAdminUsersListResource,
  formatUserFileUrl,
} from "./user.resource.js";

// Re-export helpers for backward compatibility
export const getUserPhotoUrl = (req, photo, username) =>
  formatUserFileUrl(photo, username, req);
export const getStudentPhotoUrl = getUserPhotoUrl;

export const formatUserResponse = (req, user) =>
  toUserProfileResource(user, req);
export const formatStudentResponse = formatUserResponse;

// ==========================================
// User Self Profile Routes (/users/me)
// ==========================================

export const getMe = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const rawUser = await service.get(id);
  if (!rawUser) {
    throw new ApiError("User does not exist", StatusCode.NOT_FOUND);
  }
  const result = toUserProfileResource(rawUser, req);
  res.status(StatusCode.OK).json({ status: "success", result });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const allowedFields = ["username", "user_profile_photo"];
  const data = pick(req.body, allowedFields);

  const updatedUser = await service.updateMe(user.id, data);
  const result = toUserProfileResource(updatedUser, req);
  const profilePhotoUrl = result?.profile_photo_url || null;

  res.status(StatusCode.OK).json({
    status: "success",
    msg: "Data updated successfully",
    profile_photo_url: profilePhotoUrl,
    result,
  });
});

// ==========================================
// Admin User Management Routes (/users)
// ==========================================

export const getAll = asyncHandler(async (req, res) => {
  const allowedKeys = ["username", "email", "national_id", "phone_number"];
  let searchKey, searchValue;

  for (const [key, val] of Object.entries(req.query)) {
    if (allowedKeys.includes(key) && val) {
      searchKey = key;
      searchValue = val;
      break;
    }
  }

  const generalSearch = req.query.search || req.query.searchKey || req.query.q;
    if (!searchValue && generalSearch) {
      searchKey = 'username';
      searchValue = generalSearch;
    }
    const documentStatus = req.query.document_status || req.query.status || null;
  const filters = {
    faculty_id: req.query.faculty_id || null,
    level_id: req.query.level_id || null,
    gender: req.query.gender || null,
    nationality_id: req.query.nationality_id || null,
    date: req.query.date || null,
  };
  const rawUsers = await service.getAll(searchKey, searchValue, documentStatus, filters);
  const result = toAdminUsersListResource(rawUsers, req);

  res.status(StatusCode.OK).json({
    status: "success",
    count: result.length,
    result,
  });
});

export const get = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const rawUser = await service.get(id);
  if (!rawUser) {
    throw new ApiError("User does not exist", StatusCode.NOT_FOUND);
  }

  const result = toAdminUserResource(rawUser, req);
  res.status(StatusCode.OK).json({ status: "success", result });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rawValue =
    req.body.is_active !== undefined
      ? req.body.is_active
      : req.body.status !== undefined
        ? req.body.status
        : req.body.isActive;

  if (rawValue === undefined) {
    throw new ApiError(
      "حالة الحساب (is_active) مطلوبة",
      StatusCode.BAD_REQUEST,
    );
  }

  const isActive =
    rawValue === true ||
    rawValue === 1 ||
    rawValue === "1" ||
    rawValue === "true" ||
    rawValue === "active";

  const updatedUser = await service.setUserActiveStatus(id, isActive);
  const result = toAdminUserResource(updatedUser, req);

  return res.status(StatusCode.OK).json({
    status: "success",
    message: isActive ? "تم تفعيل حساب المستخدم بنجاح" : "تم تعطيل حساب المستخدم بنجاح",
    id: result.id,
    student_id: result.id,
    result,
  });
});

export const approveDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user?.id;
  const updated = await service.approveDocuments(id, adminId);
  const result = toAdminUserResource(updated, req);

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تمت مراجعة المستندات والموافقة عليها وتفعيل حساب المستخدم بنجاح",
    result,
  });
});

export const rejectDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user?.id;
  const { reason } = req.body;
  const updated = await service.rejectDocuments(id, { reason, adminId });
  const result = toAdminUserResource(updated, req);

  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم رفض المستندات وإشعار المستخدم بالسبب بنجاح",
    result,
  });
});

export const resubmitDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const files = {
    national_id_path: req.body.national_id_path || req.body.national_id_file,
    fees_path: req.body.fees_path || req.body.fees_file,
  };
  const updated = await service.resubmitDocuments(userId, files);
  const result = toUserProfileResource(updated, req);

  return res.status(StatusCode.OK).json({
    status: "success",
    message:
      "تم إعادة إرسال المستندات بنجاح، وهي قيد المراجعة حالياً من قبل الإدارة",
    result,
  });
});

