import Base from "../../repositories/base.repository.js";
import Student from "./student.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";

export const get = async (id) => {
  const result = await new Student().getOne(id);
  return result;
};

export const updateMe = async (id, data) => {
  const studentRepo = new Student();

  // 1. Check if student exists
  const student = await studentRepo.findById(id);
  if (!student) {
    throw new ApiError("Student does not exist", StatusCode.NOT_FOUND);
  }

  // 2. Update data
  if (Object.keys(data).length > 0) {
    await studentRepo.updateOne(id, data);
  }

  // 3. Return updated student profile
  return await studentRepo.getOne(id);
};

export const getAll = async () => {
  return new Student("students").getAll();
};

export const update = async (id, data) => {
  // 1. Check if student does not exist
  const studentExists = await new Student().findById(id);
  if (!studentExists)
    throw new ApiError("Student does not exist", StatusCode.NOT_FOUND);

  // 2. if national_id or phone provided -> check existence
  if (data.national_id) {
    const nationalIdExists = await new Student().existsByField(
      "national_id",
      data.national_id,
    );
    if (nationalIdExists) throw new ApiError("National ID already exists");
  }
  if (data.phone_number) {
    const phoneExists = await new Student().existsByField(
      "phone_number",
      data.phone_number,
    );
    if (phoneExists) throw new ApiError("Phone number already exists");
  }

  // 3. excute sql
  const done = await new Student().updateOne(id, data);
  return done;
};
