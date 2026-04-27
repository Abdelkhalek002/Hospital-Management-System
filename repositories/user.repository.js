import { query, queryOne, transaction } from "../config/db-helpers.js";
import Base from "./base.repository.js";

class User extends Base {
  constructor(type) {
    super(type);
    this.type = type;
  }
  async activateEmail(email) {
    const sql = `UPDATE ${this.table} SET verified = 1 WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return result;
  }
  async deActivateEmail(email) {
    const sql = `UPDATE ${this.table} SET verified = 0 WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return result;
  }
  async setOnline(id) {
    const sql = `UPDATE ${this.type} SET is_active = 1 WHERE id = ?`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }
  async setOffline(id) {
    const sql = `UPDATE ${this.table} SET is_active = 0 WHERE id = ?`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }
  async findByEmail(email) {
    if (this.table === "super_admins" || this.table === "admins") {
      const sql = `SELECT username, email, password, role, id FROM ${this.table} WHERE email = ? LIMIT 1`;
      const result = await queryOne(sql, [email]);
      return result;
    }
    if (this.table === "students") {
      const sql = `SELECT username, email, password, id FROM ${this.table} WHERE email = ? LIMIT 1`;
      const result = await queryOne(sql, [email]);
      return result;
    }
  }
}

export default User;
