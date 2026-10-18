import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Reservation extends Base {
  constructor() {
    super("reservations");
  }

  async accept(id) {
    const sql = `UPDATE reservations SET status = "مقبول" WHERE id = ?`;
    const result = await query(sql, [id]);
    return !!result;
  }

  async decline(id) {
    const sql = `UPDATE reservations SET status = "مرفوض" WHERE id = ?`;
    const result = await query(sql, [id]);
    return !!result;
  }

  async findByDate(date) {
    const sql = `SELECT * FROM reservations WHERE date = ?`;
    return await query(sql, [date]);
  }

  async countByUserAndDate(userId, date) {
    const sql = `SELECT COUNT(*) AS count FROM reservations WHERE user_id = ? AND DATE(date) = DATE(?)`;
    const result = await query(sql, [userId, date]);
    return result[0]?.count || 0;
  }

  async countByStudentAndDate(studentId, date) {
    return await this.countByUserAndDate(studentId, date);
  }

  async create(data) {
    const userId = data.user_id ?? data.student_id ?? null;
    const clinicId = data.clinic_id ?? null;
    const date = data.date || new Date();
    const examType =
      data.examType ??
      data.exam_type ??
      (userId ? "كشف جديد" : "طواريْ");
    const status =
      data.status ??
      (examType === "طواريْ" || examType === "EMERGENCY"
        ? "مقبول"
        : "تحت الانتظار");
    const patientName =
      data.patient_name ?? data.patientName ?? data.Name ?? null;
    const nationalId =
      data.national_id != null ? String(data.national_id) : null;
    const phoneNumber =
      data.phone_number ?? data.phoneNumber ?? null;

    const sql = `
      INSERT INTO reservations 
        (user_id, patient_name, national_id, phone_number, clinic_id, date, exam_type, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      userId,
      patientName,
      nationalId,
      phoneNumber,
      clinicId,
      date,
      examType,
      status,
    ]);
    return result.insertId;
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.clinic_id !== undefined) {
      fields.push("clinic_id = ?");
      values.push(data.clinic_id);
    }
    if (data.date !== undefined) {
      fields.push("date = ?");
      values.push(data.date);
    }
    if (data.examType !== undefined || data.exam_type !== undefined) {
      fields.push("exam_type = ?");
      values.push(data.examType ?? data.exam_type);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }
    if (data.patient_name !== undefined || data.Name !== undefined) {
      fields.push("patient_name = ?");
      values.push(data.patient_name ?? data.Name);
    }
    if (data.national_id !== undefined) {
      fields.push("national_id = ?");
      values.push(data.national_id != null ? String(data.national_id) : null);
    }
    if (data.phone_number !== undefined) {
      fields.push("phone_number = ?");
      values.push(data.phone_number);
    }

    if (fields.length === 0) return 0;

    values.push(id);
    const sql = `UPDATE reservations SET ${fields.join(", ")} WHERE id = ?`;
    return await query(sql, values);
  }

  async findByIdWithClinic(id) {
    const sql = `
      SELECT 
        reservations.*,  
        clinics.clinic_name AS clinic_name,
        users.username AS user_name,
        users.username AS student_name,
        COALESCE(users.national_id, reservations.national_id) AS national_id,
        users.user_image_path
      FROM 
        reservations 
        LEFT JOIN clinics ON reservations.clinic_id = clinics.id
        LEFT JOIN users ON reservations.user_id = users.id
      WHERE 
        reservations.id = ?
    `;
    return await query(sql, [id]);
  }

  async getUserReservations({ user_id, page, limit }) {
    const countSql = `SELECT COUNT(*) AS count FROM reservations WHERE user_id = ?`;
    const dataSql = `
      SELECT 
        reservations.*,  
        clinics.clinic_name AS clinic_name, 
        users.id AS user_id,
        users.id AS student_id,
        users.username AS user_name,
        users.username AS student_name,
        users.user_image_path,
        users.user_image_path AS user_image_file,
        transfers.transfer_reason AS transferReason,
        transfers.notes,
        external_hospitals.hospital_name AS ex_hosp_name
      FROM 
        reservations 
        LEFT JOIN clinics ON reservations.clinic_id = clinics.id
        LEFT JOIN users ON reservations.user_id = users.id
        LEFT JOIN transfers ON reservations.id = transfers.reservation_id
        LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      WHERE 
        reservations.user_id = ?
      ORDER BY
        reservations.id DESC
      LIMIT ? OFFSET ?
    `;

    return await this.paginate({
      countSql,
      dataSql,
      params: [user_id],
      page,
      limit,
    });
  }

  async getStudentReservations({ student_id, user_id, page, limit }) {
    return await this.getUserReservations({
      user_id: user_id ?? student_id,
      page,
      limit,
    });
  }

  async delete(id) {
    const sql = `DELETE FROM reservations WHERE id = ?`;
    return await query(sql, [id]);
  }

  async getAllAdminReservations({
    page,
    limit,
    searchKey = "",
    examType = null,
    month = null,
    year = null,
    clinicId = null,
    status = null,
    date = null,
    facultyId = null,
    levelId = null,
    gender = null,
    nationalityId = null,
  }) {
    const searchParam = `%${searchKey}%`;
    const whereClauses = [];
    const params = [];

    // Search filter
    if (searchKey) {
      whereClauses.push(`(
        reservations.exam_type LIKE ? 
        OR reservations.status LIKE ? 
        OR reservations.patient_name LIKE ?
        OR reservations.national_id LIKE ?
        OR reservations.phone_number LIKE ?
        OR users.username LIKE ? 
        OR users.email LIKE ? 
        OR users.national_id LIKE ? 
        OR users.phone_number LIKE ?
        OR clinics.clinic_name LIKE ?
        OR levels.level_name LIKE ?
      )`);
      for (let i = 0; i < 11; i++) {
        params.push(searchParam);
      }
    }

    // Exam type filter (e.g. 'طواريْ')
    if (examType) {
      whereClauses.push(`reservations.exam_type = ?`);
      params.push(examType);
    }

    // Month filter (1-12)
    if (month !== null && month !== undefined && month !== "") {
      whereClauses.push(`MONTH(reservations.date) = ?`);
      params.push(Number(month));
    }

    // Year filter (e.g. 2026)
    if (year !== null && year !== undefined && year !== "") {
      whereClauses.push(`YEAR(reservations.date) = ?`);
      params.push(Number(year));
    }

    // Clinic filter
    if (clinicId) {
      whereClauses.push(`reservations.clinic_id = ?`);
      params.push(Number(clinicId));
    }

    // Exact Date filter (YYYY-MM-DD)
    if (date) {
      whereClauses.push(`DATE(reservations.date) = ?`);
      params.push(date);
    }

    // Faculty filter
    if (facultyId) {
      whereClauses.push(`users.faculty_id = ?`);
      params.push(Number(facultyId));
    }

    // Level filter
    if (levelId) {
      whereClauses.push(`users.level_id = ?`);
      params.push(Number(levelId));
    }

    // Gender filter
    if (gender) {
      whereClauses.push(`users.gender = ?`);
      params.push(gender);
    }

    // Nationality filter
    if (nationalityId) {
      whereClauses.push(`users.nationality_id = ?`);
      params.push(Number(nationalityId));
    }

    // Status filter
    if (status) {
      if (status === "finished" || status === "مكتمل" || status === "منتهي") {
        whereClauses.push(`reservations.status IN ('مقبول', 'مرفوض')`);
      } else if (status === "pending" || status === "معلق" || status === "تحت الانتظار") {
        whereClauses.push(`reservations.status = 'تحت الانتظار'`);
      } else {
        whereClauses.push(`reservations.status = ?`);
        params.push(status);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSql = `
      SELECT COUNT(*) AS count 
      FROM reservations 
      LEFT JOIN users ON reservations.user_id = users.id 
      LEFT JOIN clinics ON reservations.clinic_id = clinics.id
      LEFT JOIN levels ON users.level_id = levels.id
      ${whereSql}
    `;

    const dataSql = `
      SELECT 
        reservations.*,  
        clinics.clinic_name AS clinic_name, 
        levels.level_name AS level_name,
        users.id AS user_id,
        users.id AS student_id,
        COALESCE(users.username, reservations.patient_name) AS user_name,
        COALESCE(users.username, reservations.patient_name) AS student_name,
        COALESCE(users.national_id, reservations.national_id) AS national_id,
        COALESCE(users.phone_number, reservations.phone_number) AS phone_number,
        users.user_image_path,
        users.user_image_path AS user_image_file,
        users.national_id_path,
        users.national_id_path AS national_id_img,
        users.fees_path,
        users.fees_path AS fees_file,
        users.email AS user_email,
        users.email AS student_email,
        transfers.id AS transfer_id,
        external_hospitals.hospital_name AS transfered_to,
        transfers.transfer_reason AS transferReason,
        transfers.notes
      FROM 
        reservations 
        LEFT JOIN clinics ON reservations.clinic_id = clinics.id
        LEFT JOIN users ON reservations.user_id = users.id
        LEFT JOIN levels ON users.level_id = levels.id
        LEFT JOIN transfers ON reservations.id = transfers.reservation_id
        LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      ${whereSql}
      ORDER BY
        reservations.id DESC
      LIMIT ? OFFSET ?
    `;

    return await this.paginate({
      countSql,
      dataSql,
      params,
      page,
      limit,
    });
  }
}

export default Reservation;
