import { query, queryOne, transaction } from "../../../config/db-helpers.js";

class AuthRepo {
  async findByEmailForAuth(email) {
    const sql = `SELECT username, email, password, student_id, verified FROM students WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return result;
  }
}

export default AuthRepo;
