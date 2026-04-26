import Base from "../../repositories/base.repository.js";
import Student from "./student.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";

export const getOne = async (id) => {
  const result = await new Student().getOne(id);
  return result;
};

export const updateMe = async (id, data) => {
  // 1. check governorate providence and existence
  if (data.hasOwnProperty("gov_id")) {
    const govExists = await new Base("governorates").findById(data.gov_id);
    if (!govExists)
      throw new ApiError("Invalid governorate Data", StatusCode.BAD_REQUEST);
  }
  // 2. update data
  const result = await new Student().updateMe(id, data);
  return result;
};

export const getAll = async () => {
  return new Student("students").getAll();
};
