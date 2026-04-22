import { query, queryOne, transaction } from "../config/db-helpers.js";

class Base {
  async existsByField(table, field, value) {
    const sql = `SELECT 1 FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const result = await queryOne(sql, [value]);
    //console.log(result);
    return !!result;
  }
}

export default Base;
