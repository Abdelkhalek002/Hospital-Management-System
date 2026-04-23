import { query, queryOne, transaction } from "../config/db-helpers.js";

class Base {
  constructor(tableName) {
    this.table = tableName;
  }

  async execute(sql, params = []) {
    return await query(sql, params);
  }

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

  buildPagination(page = 1, limit = 10) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const offset = (safePage - 1) * safeLimit;

    return { page: safePage, limit: safeLimit, offset };
  }

  async paginate({ countSql, dataSql, params = [], page, limit }) {
    const { offset, limit: safeLimit } = this.buildPagination(page, limit);

    const countResult = await this.execute(countSql, params);
    const totalCount = countResult[0].count;

    if (!totalCount) {
      return { totalCount: 0, totalPages: 0, data: [] };
    }

    const totalPages = Math.ceil(totalCount / safeLimit);

    const data = await this.execute(dataSql, [...params, safeLimit, offset]);

    return {
      totalCount,
      totalPages,
      data,
    };
  }

  buildSearch(columns = [], searchKey = "") {
    if (!searchKey || columns.length === 0) {
      return { clause: "1=1", params: [] };
    }

    const like = `%${searchKey}%`;

    return {
      clause: "(" + columns.map((c) => `${c} LIKE ?`).join(" OR ") + ")",
      params: columns.map(() => like),
    };
  }
}

export default Base;
