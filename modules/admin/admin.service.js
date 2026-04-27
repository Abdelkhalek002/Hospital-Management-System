import bcrypt from "bcrypt";
import Base from "../../repositories/base.repository.js";
import Admin from "./admin.repository.js";
import * as emailService from "../../services/email.service.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

export const createOne = async (data) => {
  // 1. check if username or email provided is already existed
  const usernameExists = await new Base("super_admins").existsByField(
    "username",
    data.username,
  );
  if (usernameExists) throw new ApiError("username already exists");
  const emailExists = await new Base("super_admins").existsByField(
    "email",
    data.email,
  );
  if (emailExists) throw new ApiError("email already exists");

  // 2. hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  //3. build final payload
  const finalData = {
    ...data,
    password: hashedPassword,
  };

  //4. create super admin
  const newAdmin = await new Admin().create(finalData);

  return newAdmin;
};
export const updateOne = async (id, data) => {
  // 1. Check if the admin exists
  const user = await new Admin().findById(id);
  if (!user) throw new ApiError("Admin does not exist");

  // 2. Update admin details
  const done = await new Admin().updateOne(id, data);

  return done;
};
export const getOne = async (data) => {
  const admin = await new Admin().execute(
    "SELECT id, username, email, role, is_active, is_confirmed, created_at, updated_at FROM admins WHERE id = ? LIMIT 1",
    [data],
  );

  if (admin.length === 0) {
    throw new ApiError("Admin does not exist", StatusCode.NOT_FOUND);
  }

  return admin[0];
};
export const getAll = async (data) => {
  return await new Admin().getAll();
};
export const deleteOne = async (data) => {
  const admin = await new Admin().execute(
    "SELECT id, username, email, role FROM admins WHERE id = ? LIMIT 1",
    [data],
  );

  if (admin.length === 0) {
    throw new ApiError("Admin does not exist", StatusCode.NOT_FOUND);
  }

  await new Admin().execute("DELETE FROM admins WHERE id = ?", [data]);

  return admin[0];
};
export const getLogs = async (data) => {
  //
};
export const getLog = async (data) => {
  //
};
export const deleteLogs = async (data) => {
  //
};
export const deleteLog = async (data) => {
  //
};
