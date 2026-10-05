import { query, queryOne } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";
import { roles } from "../../utils/roles.js";

class SuperAdmin extends Base {
  constructor() {
    super("super_admins");
  }

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

  async getOne(id) {
    const sql = `SELECT id, username, email, role, is_active, is_confirmed, created_at, updated_at FROM super_admins WHERE id = ? LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return result;
  }

  async getAll() {
    const sql = `SELECT id, username, email, role, is_active, is_confirmed, created_at, updated_at FROM super_admins`;
    const result = await query(sql);
    return result;
  }

  async updateOne(id, data) {
    const updates = [];
    const values = [];

    Object.keys(data).forEach((field) => {
      updates.push(`${field} = ?`);
      values.push(data[field] ?? null);
    });

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE ${this.table} SET ${updates.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);
    return result;
  }

  async deleteOne(id) {
    const sql = `DELETE FROM super_admins WHERE id = ?`;
    const result = await query(sql, [id]);
    return result;
  }
}

export default SuperAdmin;
