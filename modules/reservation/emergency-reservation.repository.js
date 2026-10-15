import { query, queryOne } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class EmergencyReservation extends Base {
  constructor() {
    super("emergency_reservations");
  }

  async create(data) {
    const sql = `
      INSERT INTO emergency_reservations 
      (Name, national_id, level_id, clinic_id, gov_id, faculty_id, nationality_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      data.Name,
      data.national_id,
      data.level_id,
      data.clinic_id,
      data.gov_id,
      data.faculty_id,
      data.nationality_id,
    ]);
    return result.insertId;
  }

  async findById(emergencyUser_id) {
    const sql = `SELECT * FROM emergency_reservations WHERE emergencyUser_id = ? LIMIT 1`;
    return await queryOne(sql, [emergencyUser_id]);
  }

  async update(emergencyUser_id, data) {
    const sql = `
      UPDATE emergency_reservations 
      SET Name = ?, national_id = ?, level_id = ?, clinic_id = ?, gov_id = ?, faculty_id = ?, nationality_id = ?
      WHERE emergencyUser_id = ?
    `;
    const result = await query(sql, [
      data.Name,
      data.national_id,
      data.level_id,
      data.clinic_id,
      data.gov_id,
      data.faculty_id,
      data.nationality_id,
      emergencyUser_id,
    ]);
    return result;
  }

  async delete(emergencyUser_id) {
    const sql = `DELETE FROM emergency_reservations WHERE emergencyUser_id = ?`;
    const result = await query(sql, [emergencyUser_id]);
    return result;
  }

  async getAll({ page, limit }) {
    const countSql = `SELECT COUNT(*) AS count FROM emergency_reservations`;
    const dataSql = `
      SELECT 
        emergency_reservations.*,  
        clinics.clinic_name AS clinic_name,
        levels.level_name AS level_name,
        faculties.faculty_name AS faculty_name,
        governorates.gov_name AS gov_name,
        nationality.nationality_name AS Nationlaity
      FROM 
        emergency_reservations 
        LEFT JOIN clinics ON emergency_reservations.clinic_id = clinics.id
        LEFT JOIN levels ON emergency_reservations.level_id = levels.id
        LEFT JOIN faculties ON emergency_reservations.faculty_id = faculties.id
        LEFT JOIN governorates ON emergency_reservations.gov_id = governorates.id
        LEFT JOIN nationality ON emergency_reservations.nationality_id = nationality.id
      ORDER BY
        emergency_reservations.emergencyUser_id DESC
      LIMIT ? OFFSET ?
    `;

    return await this.paginate({
      countSql,
      dataSql,
      page,
      limit,
    });
  }
}

export default EmergencyReservation;
