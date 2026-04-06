import ApiError from "../../../utils/api-error";
import { StatusCode } from "../../../utils/status-codes";

// utils/audit-log.util.js
export const auditLog = ({ method, body, user }) => {
  user.role === roles.SUPER_ADMIN
    ? query(
        "INSERT INTO admin_log (admin_id, method, body, created_at) VALUES (?, ?, ?, ?)",
        [user.id, method, JSON.stringify(body)],
        new Date().toISOString(),
      )
    : new ApiError(
        "error storing admin logging activity",
        StatusCode.BAD_REQUEST,
      );
};
