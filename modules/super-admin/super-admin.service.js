import bcrypt from "bcrypt";
import SuperAdmin from "./super-admin.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

export const addOne = async (data) => {
  const superAdminRepo = new SuperAdmin();

  // 1. check if username or email provided already exists
  const usernameExists = await superAdminRepo.existsByField(
    "username",
    data.username,
  );
  if (usernameExists) {
    throw new ApiError("Username already exists", StatusCode.BAD_REQUEST);
  }

  const emailExists = await superAdminRepo.existsByField(
    "email",
    data.email,
  );
  if (emailExists) {
    throw new ApiError("Email already exists", StatusCode.BAD_REQUEST);
  }

  // 2. hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // 3. build final payload
  const finalData = {
    ...data,
    password: hashedPassword,
  };

  // 4. create super admin
  const result = await superAdminRepo.create(finalData);
  return result;
};

export const getOne = async (id) => {
  const superAdmin = await new SuperAdmin().getOne(id);
  if (!superAdmin) {
    throw new ApiError("Super admin does not exist", StatusCode.NOT_FOUND);
  }
  return superAdmin;
};

export const getAll = async () => {
  return await new SuperAdmin().getAll();
};

export const updateOne = async (id, data) => {
  const superAdminRepo = new SuperAdmin();

  // 1. Check if super admin exists
  const existing = await superAdminRepo.findById(id);
  if (!existing) {
    throw new ApiError("Super admin does not exist", StatusCode.NOT_FOUND);
  }

  // 2. If username or email is being updated, verify uniqueness
  if (data.username && data.username !== existing.username) {
    const usernameExists = await superAdminRepo.existsByField(
      "username",
      data.username,
    );
    if (usernameExists) {
      throw new ApiError("Username already exists", StatusCode.BAD_REQUEST);
    }
  }

  if (data.email && data.email !== existing.email) {
    const emailExists = await superAdminRepo.existsByField(
      "email",
      data.email,
    );
    if (emailExists) {
      throw new ApiError("Email already exists", StatusCode.BAD_REQUEST);
    }
  }

  // 3. If password is being updated, hash it
  const updatePayload = { ...data };
  if (updatePayload.password) {
    updatePayload.password = await bcrypt.hash(updatePayload.password, 12);
  }

  return await superAdminRepo.updateOne(id, updatePayload);
};

export const deleteOne = async (id) => {
  const superAdminRepo = new SuperAdmin();
  const existing = await superAdminRepo.findById(id);
  if (!existing) {
    throw new ApiError("Super admin does not exist", StatusCode.NOT_FOUND);
  }

  await superAdminRepo.deleteOne(id);
  return { id: existing.id, username: existing.username, email: existing.email };
};
