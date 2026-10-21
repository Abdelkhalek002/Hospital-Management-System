import path from "path";
import { promises as fs } from "fs";
import bcrypt from "bcrypt";
import Admin from "./admin.repository.js";
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

  // 2. hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // 3. build final payload
  const finalData = {
    ...data,
    password: hashedPassword,
    profile_photo_path: data.profile_photo_path || data.profile_photo || null,
  };
  delete finalData.profile_photo;

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

  const newPhoto = updatePayload.profile_photo_path ?? updatePayload.profile_photo;
  const oldPhoto = existing.profile_photo_path || existing.profile_photo;

  // 5. Clean up old photo file if photo is updated or removed
  if (newPhoto !== undefined && oldPhoto && oldPhoto !== newPhoto) {
    const oldFilePath = path.join("uploads", "admins", oldPhoto);
    fs.unlink(oldFilePath).catch(() => { });
  }

  if (newPhoto !== undefined) {
    updatePayload.profile_photo_path = newPhoto;
  }
  delete updatePayload.profile_photo;

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
  if (existing && existing.role === "SUPER_ADMIN") {
    throw new ApiError("لا يمكن حذف أو تعديل بيانات مدير النظام", StatusCode.BAD_REQUEST);
  }

  if (!existing) {
    throw new ApiError("Admin does not exist", StatusCode.NOT_FOUND);
  }

  const photo = existing.profile_photo_path || existing.profile_photo;
  if (photo) {
    const oldFilePath = path.join("uploads", "admins", photo);
    fs.unlink(oldFilePath).catch(() => { });
  }

  await adminRepo.deleteOne(id);

  return {
    id: existing.id,
    username: existing.username,
    email: existing.email,
    role: existing.role,
  };
};


