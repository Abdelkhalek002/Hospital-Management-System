import Base from "../../repositories/base.repository.js";
import { query } from "../../config/db-helpers.js";

class LogRepository extends Base {
  constructor() {
    super("admin_log");
  }

  async createLog(data) {
    const sql = `
      INSERT INTO admin_log (
        admin_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        status,
        method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const details = data.details
      ? typeof data.details === "string"
        ? data.details
        : JSON.stringify(data.details)
      : null;

    const result = await query(sql, [
      data.adminId ?? data.admin_id ?? null,
      data.action ?? null,
      data.entityType ?? data.entity_type ?? null,
      data.entityId ?? data.entity_id ?? null,
      details,
      data.ipAddress ?? data.ip_address ?? null,
      data.userAgent ?? data.user_agent ?? null,
      data.status ?? "SUCCESS",
      data.method ?? data.action ?? "عملية إدارية",
    ]);
    return result;
  }

  async findLogs({ page = 1, limit = 10, adminId = null, action = null, status = null } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (safePage - 1) * safeLimit;

    const whereClauses = [];
    const params = [];

    if (adminId) {
      whereClauses.push("l.admin_id = ?");
      params.push(adminId);
    }
    if (action) {
      whereClauses.push("l.action = ?");
      params.push(action);
    }
    if (status) {
      whereClauses.push("l.status = ?");
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS count FROM admin_log l ${whereSql}`;
    const countResult = await this.execute(countSql, params);
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / safeLimit);

    const dataSql = `
      SELECT 
        l.id, 
        l.admin_id, 
        a.username AS admin_name, 
        l.action, 
        l.entity_type, 
        l.entity_id, 
        l.details, 
        l.ip_address, 
        l.user_agent, 
        l.status, 
        l.method, 
        l.created_at 
      FROM admin_log l 
      LEFT JOIN admins a ON l.admin_id = a.id 
      ${whereSql}
      ORDER BY l.id DESC 
      LIMIT ? OFFSET ?
    `;

    const logs = await this.execute(dataSql, [...params, safeLimit, offset]);

    return {
      totalCount,
      totalPages,
      currentPage: safePage,
      adminLogs: logs,
    };
  }

  async findByAdminId(adminId) {
    const sql = `
      SELECT 
        l.id, 
        l.admin_id, 
        a.username AS admin_name, 
        l.action, 
        l.entity_type, 
        l.entity_id, 
        l.details, 
        l.ip_address, 
        l.user_agent, 
        l.status, 
        l.method, 
        l.created_at 
      FROM admin_log l 
      LEFT JOIN admins a ON l.admin_id = a.id 
      WHERE l.admin_id = ? 
      ORDER BY l.id DESC
    `;
    return await this.execute(sql, [adminId]);
  }

  async deleteAll() {
    return await this.execute("DELETE FROM admin_log");
  }

  async deleteByAdminId(adminId) {
    return await this.execute("DELETE FROM admin_log WHERE admin_id = ?", [adminId]);
  }

  async existsByAdminId(adminId) {
    const sql = "SELECT id FROM admin_log WHERE admin_id = ? LIMIT 1";
    const result = await this.execute(sql, [adminId]);
    return result && result.length > 0;
  }
}

export default LogRepository;
