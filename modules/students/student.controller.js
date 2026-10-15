import asyncHandler from "express-async-handler";
import * as service from "./student.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";
import ApiError from "../../utils/api-error.js";
import {
  toStudentProfileResource,
  toAdminStudentResource,
  toAdminStudentsListResource,
  formatStudentFileUrl,
} from "./student.resource.js";

// Re-export helpers for backward compatibility
export const getStudentPhotoUrl = (req, photo, username) =>
  formatStudentFileUrl(photo, username, req);

export const formatStudentResponse = (req, student) =>
  toStudentProfileResource(student, req);

// ==========================================
// Student Self Profile Routes (/users/me)
// ==========================================

export const getMe = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const rawStudent = await service.get(id);
  if (!rawStudent) {
    throw new ApiError("Student does not exist", StatusCode.NOT_FOUND);
  }
  const result = toStudentProfileResource(rawStudent, req);
  res.status(StatusCode.OK).json({ status: "success", result });
});

export const updateMe = asyncHandler(async (req, res) => {
  // 1. pick allowed fields
  const user = req.user;
  if (!req.body.user_image_file && req.body.photo) {
    req.body.user_image_file = req.body.photo;
  }
  if (!req.body.user_image_file && req.body.userImage_file) {
    req.body.user_image_file = req.body.userImage_file;
  }
  const allowedFields = ["username", "user_image_file"];
  const data = pick(req.body, allowedFields);

  // 2. call service
  const updatedStudent = await service.updateMe(user.id, data);
  const result = toStudentProfileResource(updatedStudent, req);
  const profilePhotoUrl = result?.profile_photo_url || null;

  // 3. send response
  res.status(StatusCode.OK).json({
    status: "success",
    msg: "Data updated successfully",
    profile_photo_url: profilePhotoUrl,
    result,
  });
});

// ==========================================
// Admin Student Management Routes (/users)
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

  const rawStudents = await service.getAll(searchKey, searchValue);
  const result = toAdminStudentsListResource(rawStudents, req);

  res.status(StatusCode.OK).json({
    status: "success",
    count: result.length,
    result,
  });
});

export const get = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const rawStudent = await service.get(id);
  if (!rawStudent) {
    throw new ApiError("Student does not exist", StatusCode.NOT_FOUND);
  }

  const result = toAdminStudentResource(rawStudent, req);
  res.status(StatusCode.OK).json({ status: "success", result });
});

export const update = asyncHandler(async (req, res) => {
  // 1. pick allowed fields from req
  const { id } = req.params;
  const allowedFields = [
    "national_id",
    "phone_number",
    "faculty_id",
    "level_id",
    "nationality_id",
    "national_id_file",
    "fees_file",
  ];
  const data = pick(req.body, allowedFields);

  // 2. call service
  await service.update(id, data);
  const updatedStudent = await service.get(id);
  const result = toAdminStudentResource(updatedStudent, req);

  // 3. send response
  return res.status(StatusCode.OK).json({
    status: "success",
    message: "تم تعديل بيانات المستخدم بنجاح",
    result,
  });
});
