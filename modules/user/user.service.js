import Base from "../../repositories/base.repository.js";
import UserRepository from "./user.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { pick } from "../../utils/pick-from-body-request.js";
import * as emailService from "../../services/email.service.js";

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

export const getAll = async (searchKey, searchValue, documentStatus = null) => {
  return new UserRepository().getAll(searchKey, searchValue, documentStatus);
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

export const approveDocuments = async (userId, adminId) => {
  const userRepo = new UserRepository();
  const user = await userRepo.getOne(userId);
  if (!user) {
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  }

  if (!user.verified) {
    throw new ApiError(
      "لا يمكن اعتماد مستندات مستخدم لم يقم بتأكيد بريده الإلكتروني بعد",
      StatusCode.BAD_REQUEST,
    );
  }

  await userRepo.updateDocumentStatus(userId, {
    status: "approved",
    reviewedBy: adminId,
  });

  try {
    await emailService.sendDocumentApprovalMail(user);
  } catch (err) {
    console.error("Failed to send document approval email:", err);
  }

  return await userRepo.getOne(userId);
};

export const rejectDocuments = async (userId, { reason, adminId }) => {
  const userRepo = new UserRepository();
  const user = await userRepo.getOne(userId);
  if (!user) {
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  }

  if (!reason || !String(reason).trim()) {
    throw new ApiError("سبب الرفض مطلوب", StatusCode.BAD_REQUEST);
  }

  await userRepo.updateDocumentStatus(userId, {
    status: "rejected",
    rejectionReason: String(reason).trim(),
    reviewedBy: adminId,
  });

  try {
    await emailService.sendDocumentRejectionMail(user, String(reason).trim());
  } catch (err) {
    console.error("Failed to send document rejection email:", err);
  }

  return await userRepo.getOne(userId);
};

export const resubmitDocuments = async (userId, data) => {
  const userRepo = new UserRepository();
  const user = await userRepo.getOne(userId);
  if (!user) {
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  }

  const cleanData = {};
  if (data.national_id_path || data.national_id_file) {
    cleanData.national_id_path = data.national_id_path || data.national_id_file;
  }
  if (data.fees_path || data.fees_file) {
    cleanData.fees_path = data.fees_path || data.fees_file;
  }

  if (Object.keys(cleanData).length === 0) {
    throw new ApiError(
      "يرجى إرفاق صورة بطاقة الرقم القومي أو إيصال الرسوم لإعادة الفحص",
      StatusCode.BAD_REQUEST,
    );
  }

  await userRepo.updateOne(userId, cleanData);
  await userRepo.updateDocumentStatus(userId, { status: "pending" });

  return await userRepo.getOne(userId);
};

