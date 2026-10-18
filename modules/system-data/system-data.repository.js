import Base from "../../repositories/base.repository.js";
import { query, queryOne } from "../../config/db-helpers.js";

export const SYSTEM_DATA_RESOURCES = Object.freeze({
  clinics: {
    table: "clinics",
    column: "clinic_name",
    alias: "clinicName",
    label: "العيادة",
    paramKey: "clinic_id",
  },
  faculties: {
    table: "faculties",
    column: "faculty_name",
    alias: "facultyName",
    label: "الكلية",
    paramKey: "faculty_id",
  },
  governorates: {
    table: "governorates",
    column: "gov_name",
    alias: "govName",
    label: "المحافظة",
    paramKey: "gov_id",
  },
  hospitals: {
    table: "external_hospitals",
    column: "hospital_name",
    alias: "hospName",
    label: "المستشفى",
    paramKey: "exHosp_id",
  },
  levels: {
    table: "levels",
    column: "level_name",
    alias: "levelName",
    label: "المستوى",
    paramKey: "level_id",
  },
});

class SystemDataRepository extends Base {
  constructor(resourceKey) {
    const config = SYSTEM_DATA_RESOURCES[resourceKey];
    if (!config) {
      throw new Error(`Invalid system data resource: ${resourceKey}`);
    }
    super(config.table);
    this.resourceKey = resourceKey;
    this.config = config;
  }

  _mapRow(row) {
    if (!row) return null;
    return {
      ...row,
      is_active: Boolean(row.is_active),
    };
  }

  async getAll(filter = {}) {
    const { table, column, alias } = this.config;
    let sql = `SELECT id, ${column}, ${column} AS ${alias}, is_active, created_at, updated_at FROM ${table}`;
    const conditions = [];
    const params = [];

    if (filter.isActive !== undefined && filter.isActive !== null) {
      conditions.push(`is_active = ?`);
      params.push(filter.isActive ? 1 : 0);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` ORDER BY id DESC`;
    const rows = await query(sql, params);
    return rows.map((r) => this._mapRow(r));
  }

  async getById(id) {
    const { table, column, alias } = this.config;
    const sql = `SELECT id, ${column}, ${column} AS ${alias}, is_active, created_at, updated_at FROM ${table} WHERE id = ? LIMIT 1`;
    const row = await queryOne(sql, [id]);
    return this._mapRow(row);
  }

  async getByName(name) {
    const { table, column, alias } = this.config;
    const sql = `SELECT id, ${column}, ${column} AS ${alias}, is_active FROM ${table} WHERE ${column} = ? LIMIT 1`;
    const row = await queryOne(sql, [name]);
    return this._mapRow(row);
  }

  async existsByName(name, excludeId = null) {
    const { table, column } = this.config;
    let sql = `SELECT 1 FROM ${table} WHERE ${column} = ?`;
    const params = [name];
    if (excludeId !== null && excludeId !== undefined) {
      sql += ` AND id <> ?`;
      params.push(excludeId);
    }
    sql += ` LIMIT 1`;
    const result = await queryOne(sql, params);
    return !!result;
  }

  async create(name, isActive = true) {
    const { table, column } = this.config;
    const sql = `INSERT INTO ${table} (${column}, is_active) VALUES (?, ?)`;
    const result = await query(sql, [name, isActive ? 1 : 0]);
    return result;
  }

  async update(id, data) {
    const { table, column } = this.config;
    const isObject = typeof data === "object" && data !== null;
    const name = isObject ? data.name : data;
    const isActive = isObject ? data.isActive : undefined;

    const setClauses = [];
    const params = [];

    if (name !== undefined) {
      setClauses.push(`${column} = ?`);
      params.push(name);
    }
    if (isActive !== undefined && isActive !== null) {
      setClauses.push(`is_active = ?`);
      params.push(isActive ? 1 : 0);
    }

    if (setClauses.length === 0) return null;

    params.push(id);
    const sql = `UPDATE ${table} SET ${setClauses.join(", ")} WHERE id = ?`;
    const result = await query(sql, params);
    return result;
  }

  async setActiveStatus(id, isActive) {
    const { table } = this.config;
    const sql = `UPDATE ${table} SET is_active = ? WHERE id = ?`;
    const result = await query(sql, [isActive ? 1 : 0, id]);
    return result;
  }

  async delete(id) {
    const { table } = this.config;
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = await query(sql, [id]);
    return result;
  }
}

export default SystemDataRepository;
