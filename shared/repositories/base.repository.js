import { query, queryOne, transaction } from "../../config/db-helpers.js";

class BaseRepo {
  async existsByField(table, field, value) {
    const sql = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const result = await queryOne(sql, [value]);
    return !!result;
  }
}

export default BaseRepo;
