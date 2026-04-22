import { query, queryOne } from "../../config/db-helpers.js";
import { roles } from "../../utils/roles.js";
class Admin {
  async create(data) {
    const sql = `INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [
      data.username,
      data.email,
      data.password,
      data.role,
    ]);

    return result;
  }
  async getOne(email) {
    const sql = `SELECT 1 FROM admins email = ? LIMIT = 1`;
    const result = await queryOne(sql, [email]);
    return result;
  }
  async getAll() {
    const sql = `SELECT username, email, role FROM admins`;
    const result = await query(sql);
    return result;
  }
  async createLog(data) {
    const sql = `INSERT INTO admin_log (admin_id, method, created_at) VALUES (?, ?, ?)`;
    const result = await query(sql, [
      data.adminId,
      data.method,
      data.createdAt,
    ]);
    return result;
  }
}

export default Admin;
