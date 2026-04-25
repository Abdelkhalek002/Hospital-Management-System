import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import db from "../../config/db.js";
import Base from "../../repositories/base.repository.js";
import Transfer from "./transfer.repository.js";
import MedicalExamination from "../medical-examination/medical-examination.repository.js";
import { StatusCode } from "../../utils/status-codes.js";
import { roles } from "../../utils/roles.js";
import ApiError from "../../utils/api-error.js";

export const transfer = async (data) => {
  // 1. Check if the medical examination status is 'مقبول'
  const medical_exam_accepted = await new MedicalExamination().isAccepted(
    data.medical_exam_id,
  );

  if (!medical_exam_accepted) {
    throw new ApiError(
      "Medical examination not accepted!",
      StatusCode.CONFLICT,
    );
  }

  //2. check if hospital id exists
  const hospitalResult = await new Base("external_hospitals").findById(
    data.hospital_id,
  );
  if (!hospitalResult)
    throw new ApiError("Invalid hospital data", StatusCode.NOT_FOUND);

  // 4. Insert transfer record
  const result = await new Transfer(
    data.medical_exam_id,
    data.hospital_id,
    data.transfer_reason,
    data.notes,
  ).create();
  return result;
};

export const getTransferred = async ({ page, limit, searchKey }) => {
  try {
    const result = await new MedicalExamination().index({
      page,
      limit,
      searchKey,
    });
    return result;
  } catch (error) {
    console.error("Transfer service error:", error);
    throw new ApiError(
      "Failed to fetch transferred data",
      StatusCode.BAD_REQUEST,
    );
  }
};

export const updateTransfer = async (id, data) => {
  try {
    // 1. Check for transfer existence
    const Exist = await new Transfer().findById(id);
    if (!Exist)
      throw new ApiError("بيانات التحويل غير موجودة", StatusCode.NOT_FOUND);

    // 2. update transfer data
    const updated = await new Transfer().update(id, data);

    return updated;
  } catch (error) {
    console.error("Update Transfer service error:", error);
    throw new ApiError("Failed to update transfer", StatusCode.BAD_REQUEST);
  }
};
