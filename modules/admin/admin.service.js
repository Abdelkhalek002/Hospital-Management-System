import path from "path";
import { promises as fs } from "fs";
import bcrypt from "bcrypt";
import Base from "../../repositories/base.repository.js";
import Admin from "./admin.repository.js";
import * as emailService from "../../services/email.service.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

export const createOne = async (data) => {
  const adminRepo = new Admin();

  // 1. check if username or email already exists in admins table
  const usernameExists = await adminRepo.existsByField(
    "username",
    data.username,
  );
  if (usernameExists) {
    throw new ApiError("اسم المستخدم مستخدم بالفعل", StatusCode.BAD_REQUEST);
  }

  const emailExists = await adminRepo.existsByField("email", data.email);
  if (emailExists) {
    throw new ApiError("البريد الإلكتروني مستخدم بالفعل", StatusCode.BAD_REQUEST);
  }

  // Also check super_admins to prevent duplicate identities
  const superAdminUsernameExists = await new Base("super_admins").existsByField(
    "username",
    data.username,
  );
  if (superAdminUsernameExists) {
    throw new ApiError("اسم المستخدم مستخدم بالفعل", StatusCode.BAD_REQUEST);
  }

  const superAdminEmailExists = await new Base("super_admins").existsByField(
    "email",
    data.email,
  );
  if (superAdminEmailExists) {
    throw new ApiError("البريد الإلكتروني مستخدم بالفعل", StatusCode.BAD_REQUEST);
  }

  // 2. hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // 3. build final payload
  const finalData = {
    ...data,
    password: hashedPassword,
  };

  // 4. create admin
  const newAdmin = await adminRepo.create(finalData);

  return newAdmin;
};

export const updateOne = async (id, data) => {
  const adminRepo = new Admin();

  // 1. Check if the admin exists
  const existing = await adminRepo.getOne(id);
  if (!existing) {
    throw new ApiError("Admin does not exist", StatusCode.NOT_FOUND);
  }

  // 2. If username is being updated, verify uniqueness
  if (data.username && data.username !== existing.username) {
    const usernameExists = await adminRepo.existsByField(
      "username",
      data.username,
    );
    if (usernameExists) {
      throw new ApiError("اسم المستخدم مستخدم بالفعل", StatusCode.BAD_REQUEST);
    }
  }

  // 3. If email is being updated, verify uniqueness
  if (data.email && data.email !== existing.email) {
    const emailExists = await adminRepo.existsByField("email", data.email);
    if (emailExists) {
      throw new ApiError(
        "البريد الإلكتروني مستخدم بالفعل",
        StatusCode.BAD_REQUEST,
      );
    }
  }

  // 4. If password is being updated, hash it
  const updatePayload = { ...data };
  if (updatePayload.password) {
    updatePayload.password = await bcrypt.hash(updatePayload.password, 12);
  }

  // 5. Clean up old photo file if photo is updated or removed
  if (
    updatePayload.profile_photo !== undefined &&
    existing.profile_photo &&
    existing.profile_photo !== updatePayload.profile_photo
  ) {
    const oldFilePath = path.join("uploads", "admins", existing.profile_photo);
    fs.unlink(oldFilePath).catch(() => {});
  }

  // 6. Update admin details
  await adminRepo.updateOne(id, updatePayload);

  return await adminRepo.getOne(id);
};

export const getOne = async (id) => {
  const admin = await new Admin().getOne(id);

  if (!admin) {
    throw new ApiError("Admin does not exist", StatusCode.NOT_FOUND);
  }

  return admin;
};

export const getAll = async () => {
  return await new Admin().getAll();
};

export const deleteOne = async (id) => {
  const adminRepo = new Admin();
  const existing = await adminRepo.getOne(id);

  if (!existing) {
    throw new ApiError("Admin does not exist", StatusCode.NOT_FOUND);
  }

  if (existing.profile_photo) {
    const oldFilePath = path.join("uploads", "admins", existing.profile_photo);
    fs.unlink(oldFilePath).catch(() => {});
  }

  await adminRepo.deleteOne(id);

  return {
    id: existing.id,
    username: existing.username,
    email: existing.email,
    role: existing.role,
  };
};
export const getLogs = async ({ page = 1, limit = 10 } = {}) => {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  const countResult = await new Admin().execute(
    "SELECT COUNT(*) AS count FROM admin_log",
  );
  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / safeLimit);

  const logs = await new Admin().execute(
    `SELECT l.id, l.admin_id, a.username AS admin_name, l.method, l.created_at 
     FROM admin_log l 
     LEFT JOIN admins a ON l.admin_id = a.id 
     ORDER BY l.id DESC 
     LIMIT ${safeLimit} OFFSET ${offset}`,
  );

  return {
    totalPages,
    currentPage: safePage,
    adminLogs: logs,
  };
};

export const getLog = async (adminId) => {
  const logs = await new Admin().execute(
    `SELECT l.id, l.admin_id, a.username AS admin_name, l.method, l.created_at 
     FROM admin_log l 
     LEFT JOIN admins a ON l.admin_id = a.id 
     WHERE l.admin_id = ? 
     ORDER BY l.id DESC`,
    [adminId],
  );
  return logs;
};

export const deleteLogs = async () => {
  await new Admin().execute("DELETE FROM admin_log");
  return true;
};

export const deleteLog = async (adminId) => {
  const existing = await new Admin().execute(
    "SELECT id FROM admin_log WHERE admin_id = ? LIMIT 1",
    [adminId],
  );
  if (!existing || existing.length === 0) {
    throw new ApiError(
      "العمليات الخاصة بهذا المستخدم غير موجودة",
      StatusCode.NOT_FOUND,
    );
  }
  await new Admin().execute("DELETE FROM admin_log WHERE admin_id = ?", [
    adminId,
  ]);
  return true;
};

