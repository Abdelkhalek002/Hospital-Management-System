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

  async getAll() {
    const { table, column, alias } = this.config;
    const sql = `SELECT id, ${column}, ${column} AS ${alias}, created_at, updated_at FROM ${table} ORDER BY id DESC`;
    return await query(sql);
  }

  async getById(id) {
    const { table, column, alias } = this.config;
    const sql = `SELECT id, ${column}, ${column} AS ${alias}, created_at, updated_at FROM ${table} WHERE id = ? LIMIT 1`;
    return await queryOne(sql, [id]);
  }

  async getByName(name) {
    const { table, column, alias } = this.config;
    const sql = `SELECT id, ${column}, ${column} AS ${alias} FROM ${table} WHERE ${column} = ? LIMIT 1`;
    return await queryOne(sql, [name]);
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

  async create(name) {
    const { table, column } = this.config;
    const sql = `INSERT INTO ${table} (${column}) VALUES (?)`;
    const result = await query(sql, [name]);
    return result;
  }

  async update(id, name) {
    const { table, column } = this.config;
    const sql = `UPDATE ${table} SET ${column} = ? WHERE id = ?`;
    const result = await query(sql, [name, id]);
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
