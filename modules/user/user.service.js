import Base from "../../repositories/base.repository.js";
import UserRepository from "./user.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";

export const get = async (id) => {
  const result = await new UserRepository().getOne(id);
  return result;
};

export const updateMe = async (id, data) => {
  const userRepo = new UserRepository();

  // 1. Check if user exists
  const user = await userRepo.findById(id);
  if (!user) {
    throw new ApiError("User does not exist", StatusCode.NOT_FOUND);
  }

  // 2. Update data
  if (Object.keys(data).length > 0) {
    await userRepo.updateOne(id, data);
  }

  // 3. Return updated user profile
  return await userRepo.getOne(id);
};

export const getAll = async (searchKey, searchValue) => {
  return new UserRepository().getAll(searchKey, searchValue);
};

export const update = async (id, data) => {
  // 1. Check if user does not exist
  const userExists = await new UserRepository().findById(id);
  if (!userExists)
    throw new ApiError("User does not exist", StatusCode.NOT_FOUND);

  // 2. If national_id or phone provided -> check uniqueness
  if (data.national_id) {
    const nationalIdExists = await new UserRepository().existsByField(
      "national_id",
      String(data.national_id),
    );
    if (nationalIdExists && userExists.national_id !== String(data.national_id)) {
      throw new ApiError("National ID already exists");
    }
  }
  if (data.phone_number) {
    const phoneExists = await new UserRepository().existsByField(
      "phone_number",
      String(data.phone_number),
    );
    if (phoneExists && userExists.phone_number !== String(data.phone_number)) {
      throw new ApiError("Phone number already exists");
    }
  }

  // 3. Execute update
  const done = await new UserRepository().updateOne(id, data);
  return done;
};
