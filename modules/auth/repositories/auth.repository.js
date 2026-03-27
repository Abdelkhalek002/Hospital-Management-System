import { query, queryOne, transaction } from "../../../config/db-helpers.js";

class AuthRepo {
  async findByEmailForAuth(table, email) {
    const sql = `SELECT username, email, password, id FROM ${table} WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return result;
  }
}

export default AuthRepo;
