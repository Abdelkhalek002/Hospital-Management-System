import ApiError from "./api-error.js";
import Admin from "../modules/admin/admin.repository.js";
import { StatusCode } from "./status-codes.js";

export const auditLog = async (data) => {
  try {
    await new Admin().createLog(data);
    console.log("Audit record created successfully.");
  } catch (error) {
    return new ApiError(
      "error storing admin logging activity",
      StatusCode.BAD_REQUEST,
    );
  }
};
