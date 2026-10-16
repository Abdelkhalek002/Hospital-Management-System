import { query, queryOne } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";
import { roles } from "../../utils/roles.js";

class Admin extends Base {
  constructor() {
    super("admins");
  }

  async create(data) {
    const photo = data.profile_photo_path ?? data.profile_photo ?? null;
    const status = data.status ?? "active";
    const sql = `INSERT INTO admins (username, email, password, role, status, profile_photo_path) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [
      data.username,
      data.email,
      data.password,
      data.role,
      status,
      photo,
    ]);

    return {
      id: result.insertId,
      username: data.username,
      email: data.email,
      role: data.role,
      status,
      profile_photo_path: photo,
      profile_photo: photo,
    };
  }

  async getOne(id) {
    const sql = `SELECT id, username, email, role, profile_photo_path, profile_photo_path AS profile_photo, status, (status = 'active') AS is_active, created_at, updated_at FROM admins WHERE id = ? LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return result;
  }

  async updateOne(id, data) {
    const updates = [];
    const values = [];

    const cleanData = { ...data };
    if ("profile_photo" in cleanData && !("profile_photo_path" in cleanData)) {
      cleanData.profile_photo_path = cleanData.profile_photo;
      delete cleanData.profile_photo;
    }
    if ("is_active" in cleanData && !("status" in cleanData)) {
      cleanData.status = cleanData.is_active ? "active" : "inactive";
      delete cleanData.is_active;
    }

    Object.keys(cleanData).forEach((field) => {
      updates.push(`${field} = ?`);
      values.push(cleanData[field] ?? null);
    });

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE ${this.table} SET ${updates.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);
    return result;
  }

  async getAll() {
    const sql = `SELECT id, username, email, role, profile_photo_path, profile_photo_path AS profile_photo, status, (status = 'active') AS is_active, created_at, updated_at FROM admins ORDER BY id DESC`;
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
