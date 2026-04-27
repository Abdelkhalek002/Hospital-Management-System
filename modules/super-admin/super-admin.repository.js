import { query, queryOne } from "../../config/db-helpers.js";
import { roles } from "../../utils/roles.js";
class SuperAdmin {
  async create(data) {
    const sql = `INSERT INTO super_admins (username, email, password, role) VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [
      data.username,
      data.email,
      data.password,
      roles.SUPER_ADMIN,
    ]);
    return result;
  }
  async getOne(email) {
    const sql = `SELECT 1 FROM super_admins email = ? LIMIT = 1`;
    const result = await queryOne(sql, [email]);
    return result;
  }
  async getAll() {
    const sql = `SELECT username, email, role FROM super_admins`;
    const result = await query(sql);
    return result;
  }
}

export default SuperAdmin;
