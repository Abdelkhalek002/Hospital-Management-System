import { query, queryOne, transaction } from "../../config/db-helpers.js";

class UserRepo {
  async setOnline(table, id) {
    const sql = `UPDATE ${table} SET is_active = 1 WHERE id = ?`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }
  async setOffline(table, id) {
    const sql = `UPDATE ${table} SET is_active = 0 WHERE id = ?`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }
}

export default UserRepo;
