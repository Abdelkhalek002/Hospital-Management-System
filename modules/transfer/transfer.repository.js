import { query, queryOne } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Transfer extends Base {
  constructor(reservation_id, hospital_id, transfer_reason, notes) {
    super("transfers");
    this.reservation_id = reservation_id;
    this.medical_exam_id = reservation_id;
    this.hospital_id = hospital_id;
    this.transfer_reason = transfer_reason;
    this.notes = notes;
  }

  async isExamAccepted(id) {
    const sql = `SELECT id FROM reservations WHERE id = ? AND status = "مقبول" LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }

  async create() {
    const sql = `
      INSERT INTO transfers (reservation_id, hospital_id, transfer_reason, notes)
      VALUES (?, ?, ?, ?)
    `;

    return await query(sql, [
      this.reservation_id,
      this.hospital_id,
      this.transfer_reason,
      this.notes,
    ]);
  }

  async update(id, data) {
    const sql = `UPDATE transfers SET transfer_reason = ?, hospital_id = ?, notes = ? WHERE id = ?`;
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
        "reservations.exam_type",
        "users.username",
        "reservations.patient_name",
        "users.email",
        "clinics.clinic_name",
        "levels.level_name",
        "transfers.transfer_reason",
        "external_hospitals.hospital_name",
      ],
      baseWhere: `reservations.status = "مقبول"`,
      joins: `
        JOIN reservations ON transfers.reservation_id = reservations.id
        LEFT JOIN users ON reservations.user_id = users.id
        LEFT JOIN clinics ON reservations.clinic_id = clinics.id
        LEFT JOIN levels ON users.level_id = levels.id
        LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      `,
      select: `
        reservations.id,
        reservations.id AS medical_exam_id,
        reservations.id AS reservation_id,
        reservations.exam_type,
        reservations.date,
        clinics.clinic_name,
        levels.level_name,
        users.id AS user_id,
        users.id AS student_id,
        COALESCE(users.username, reservations.patient_name) AS user_name,
        COALESCE(users.username, reservations.patient_name) AS student_name,
        users.email AS user_email,
        users.email AS student_email,
        transfers.id AS transfer_id,
        transfers.transfer_reason,
        transfers.notes,
        external_hospitals.hospital_name AS transfered_to
      `,
      orderBy: "transfers.id DESC",
    });
  }
}

export default Transfer;
