import Base from "../../repositories/base.repository.js";
import Student from "../../repositories/student.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

export const getMe = async (user) => {
  const result = await new Student().getOne(user.id);
  return result;
};

export const updateMe = async (id, data) => {
  // 1. check governorate existence
  const govExists = await new Base("governorates").findById(data.gov_id);
  if (!govExists)
    throw new ApiError("Invalid governorate Data", StatusCode.BAD_REQUEST);

  // 2. update data
  const result = await new Student().update(id, data);
  return result;
};
