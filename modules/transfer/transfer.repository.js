import { query, queryOne } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Transfer extends Base {
  constructor(medical_exam_id, hospital_id, transfer_reason, notes) {
    super("transfers");
    this.medical_exam_id = medical_exam_id;
    this.hospital_id = hospital_id;
    this.transfer_reason = transfer_reason;
    this.notes = notes;
  }

  async isExamAccepted(id) {
    const sql = `SELECT id FROM medical_examinations WHERE id = ? AND status = "مقبول" LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }

  async create() {
    const sql = `
      INSERT INTO transfers (medical_exam_id, hospital_id, transfer_reason, notes)
      VALUES (?, ?, ?, ?)
    `;

    return await query(sql, [
      this.medical_exam_id,
      this.hospital_id,
      this.transfer_reason,
      this.notes,
    ]);
  }

  async update(id, data) {
    const sql = `UPDATE transfers SET transfer_reason = ?, hospital_id = ?, notes = ?  WHERE id = ?`;
    const result = await query(sql, [
      data.transfer_reason ?? null,
      data.hospital_id ?? null,
      data.notes ?? null,
      id,
    ]);
    return result;
  }

  async index(params) {
    return super.index({
      ...params,
      searchableColumns: [
        "medical_examinations.exam_type",
        "users.username",
        "users.email",
        "clinics.clinic_name",
        "levels.level_name",
        "transfers.transfer_reason",
        "external_hospitals.hospital_name",
      ],
      baseWhere: `medical_examinations.status = "مقبول"`,
      joins: `
        JOIN medical_examinations ON transfers.medical_exam_id = medical_examinations.id
        LEFT JOIN users ON medical_examinations.user_id = users.id
        LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
        LEFT JOIN levels ON users.level_id = levels.id
        LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      `,
      select: `
        medical_examinations.id,
        medical_examinations.exam_type,
        medical_examinations.date,
        clinics.clinic_name,
        levels.level_name,
        users.id AS user_id,
        users.id AS student_id,
        users.username AS user_name,
        users.username AS student_name,
        users.email AS user_email,
        users.email AS student_email,
        transfers.id AS transfer_id,
        transfers.transfer_reason,
        external_hospitals.hospital_name AS transfered_to
      `,
      orderBy: "transfers.id DESC",
    });
  }
}

export default Transfer;

