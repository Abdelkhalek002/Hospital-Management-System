import LogRepository from "./log.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

const logRepo = () => new LogRepository();

export const getLogs = async ({ page = 1, limit = 10, adminId = null, action = null, status = null } = {}) => {
  return await logRepo().findLogs({ page, limit, adminId, action, status });
};

export const getLog = async (adminId) => {
  return await logRepo().findByAdminId(adminId);
};

export const deleteLogs = async () => {
  await logRepo().deleteAll();
  return true;
};

export const deleteLog = async (adminId) => {
  const repo = logRepo();
  const exists = await repo.existsByAdminId(adminId);
  if (!exists) {
    throw new ApiError(
      "العمليات الخاصة بهذا المستخدم غير موجودة",
      StatusCode.NOT_FOUND,
    );
  }
  await repo.deleteByAdminId(adminId);
  return true;
};
