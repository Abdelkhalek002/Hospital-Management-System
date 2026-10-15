import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Reservation extends Base {
  constructor() {
    super("medical_examinations");
  }

  async getPerMonth() {
    const sql = `
    WITH RECURSIVE Months AS (
      SELECT 1 AS month
      UNION ALL
      SELECT month + 1 FROM Months WHERE month < 12
    )
    SELECT 
      CASE Months.month
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
      END AS month_name, 
      COALESCE(COUNT(medical_examinations.id), 0) AS reservationsCount
    FROM Months
    LEFT JOIN medical_examinations ON MONTH(medical_examinations.date) = Months.month AND YEAR(medical_examinations.date) = YEAR(CURDATE())
    GROUP BY Months.month;
  `;
    const results = await query(sql);
    const months = results.map((row) => {
      return {
        month: row.month_name,
        reservations: row.reservationsCount,
      };
    });
    return months;
  }

  async accept(id) {
    const sql = `UPDATE medical_examinations SET status = "مقبول" WHERE id = ?`;
    const result = await query(sql, [id]);
    return !!result;
  }

  async decline(id) {
    const sql = `UPDATE medical_examinations SET status = "مرفوض" WHERE id = ?`;
    const result = await query(sql, [id]);
    return !!result;
  }

  async findByDate(date) {
    const sql = `SELECT * FROM medical_examinations WHERE date = ?`;
    return await query(sql, [date]);
  }

  async countByStudentAndDate(studentId, date) {
    const sql = `SELECT COUNT(*) AS count FROM medical_examinations WHERE student_id = ? AND date = ?`;
    const result = await query(sql, [studentId, date]);
    return result[0]?.count || 0;
  }

  async create(data) {
    const sql = `INSERT INTO medical_examinations (student_id, clinic_id, date, exam_type) VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [
      data.student_id,
      data.clinic_id,
      data.date,
      data.examType,
    ]);
    return result.insertId;
  }

  async update(id, data) {
    const sql = `UPDATE medical_examinations SET clinic_id = ?, date = ?, exam_type = ? WHERE id = ?`;
    const result = await query(sql, [
      data.clinic_id,
      data.date,
      data.examType,
      id,
    ]);
    return result;
  }

  async findByIdWithClinic(id) {
    const sql = `
      SELECT 
        medical_examinations.*,  
        clinics.clinic_name AS clinic_name
      FROM 
        medical_examinations 
        LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      WHERE 
        medical_examinations.id = ?
    `;
    return await query(sql, [id]);
  }

  async getStudentReservations({ student_id, page, limit }) {
    const countSql = `SELECT COUNT(*) AS count FROM medical_examinations WHERE student_id = ?`;
    const dataSql = `
      SELECT 
        medical_examinations.*,  
        clinics.clinic_name AS clinic_name, 
        students.username AS student_name,
        transfers.transfer_reason AS transferReason,
        transfers.notes,
        external_hospitals.hospital_name AS ex_hosp_name
      FROM 
        medical_examinations 
        LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
        LEFT JOIN students ON medical_examinations.student_id = students.id
        LEFT JOIN transfers ON medical_examinations.id = transfers.medical_exam_id
        LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      WHERE 
        medical_examinations.student_id = ?
      ORDER BY
        medical_examinations.id DESC
      LIMIT ? OFFSET ?
    `;

    return await this.paginate({
      countSql,
      dataSql,
      params: [student_id],
      page,
      limit,
    });
  }

  async delete(id) {
    const sql = `DELETE FROM medical_examinations WHERE id = ?`;
    return await query(sql, [id]);
  }

  async getAllAdminReservations({ page, limit, searchKey = "" }) {
    const searchParam = `%${searchKey}%`;
    const countSql = `
      SELECT COUNT(*) AS count 
      FROM medical_examinations 
      LEFT JOIN students ON medical_examinations.student_id = students.id 
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      LEFT JOIN levels ON students.level_id = levels.id
      WHERE 
        medical_examinations.exam_type LIKE ? 
        OR medical_examinations.status LIKE ? 
        OR students.username LIKE ? 
        OR students.email LIKE ? 
        OR students.national_id LIKE ? 
        OR students.nationality_id LIKE ? 
        OR students.level_id LIKE ? 
        OR students.gov_id LIKE ? 
        OR students.faculty_id LIKE ? 
        OR students.phone_number LIKE ?
        OR clinics.clinic_name LIKE ?
        OR levels.level_name LIKE ?
    `;

    const dataSql = `
      SELECT 
        medical_examinations.*,  
        clinics.clinic_name AS clinic_name, 
        levels.level_name AS level_name,
        students.username AS student_name,
        students.user_image_file,
        students.national_id_file AS national_id_img,
        students.fees_file AS fees_file,
        students.email AS student_email,
        students.national_id AS national_id,
        transfers.id AS transfer_id,
        external_hospitals.hospital_name AS transfered_to,
        transfers.transfer_reason AS transferReason,
        transfers.notes
      FROM 
        medical_examinations 
        LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
        LEFT JOIN students ON medical_examinations.student_id = students.id
        LEFT JOIN levels ON students.level_id = levels.id
        LEFT JOIN transfers ON medical_examinations.id = transfers.medical_exam_id
        LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      WHERE 
        medical_examinations.exam_type LIKE ? 
        OR medical_examinations.status LIKE ? 
        OR students.username LIKE ? 
        OR students.email LIKE ? 
        OR students.national_id LIKE ? 
        OR students.nationality_id LIKE ? 
        OR students.level_id LIKE ? 
        OR students.gov_id LIKE ? 
        OR students.faculty_id LIKE ? 
        OR students.phone_number LIKE ?
        OR clinics.clinic_name LIKE ?
        OR levels.level_name LIKE ?
      ORDER BY
        medical_examinations.id DESC
      LIMIT ? OFFSET ?
    `;

    const searchConditions = Array(12).fill(searchParam);
    return await this.paginate({
      countSql,
      dataSql,
      params: searchConditions,
      page,
      limit,
    });
  }
}

export default Reservation;
