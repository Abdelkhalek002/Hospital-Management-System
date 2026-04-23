import { query, queryOne, transaction } from "../config/db-helpers.js";

class Base {
  async existsByField(table, field, value) {
    const sql = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const result = await queryOne(sql, [value]);
    return !!result;
  }
  async findById(table, id) {
    const sql = `SELECT * FROM ${table} WHERE id = ? LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return result;
  }
}

export default Base;
