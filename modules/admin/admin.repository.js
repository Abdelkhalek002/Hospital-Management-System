import { query, queryOne } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";
import { roles } from "../../utils/roles.js";
class Admin extends Base {
  constructor() {
    super("admins");
  }
  async create(data) {
    const sql = `INSERT INTO admins (username, email, password, role, profile_photo) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [
      data.username,
      data.email,
      data.password,
      data.role,
      data.profile_photo ?? null,
    ]);

    return {
      id: result.insertId,
      username: data.username,
      email: data.email,
      role: data.role,
      profile_photo: data.profile_photo ?? null,
    };
  }
  async getOne(id) {
    const sql = `SELECT id, username, email, role, profile_photo, is_active, is_confirmed, created_at, updated_at FROM admins WHERE id = ? LIMIT 1`;
    const result = await queryOne(sql, [id]);
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
  async getAll() {
    const sql = `SELECT id, username, email, role, profile_photo, is_active, is_confirmed, created_at, updated_at FROM admins ORDER BY id DESC`;
    const result = await query(sql);
    return result;
  }
  async deleteOne(id) {
    const sql = `DELETE FROM admins WHERE id = ?`;
    const result = await query(sql, [id]);
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
