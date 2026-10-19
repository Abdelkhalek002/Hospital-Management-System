import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Transfer extends Base {
  constructor(
    reservation_id = null,
    hospital_id = null,
    transfer_reason = "",
    notes = null,
    status = "pending",
  ) {
    super("transfers");
    this.reservation_id = reservation_id;
    this.medical_exam_id = reservation_id;
    this.hospital_id = hospital_id;
    this.transfer_reason = transfer_reason;
    this.notes = notes;
    this.status = status;
  }

  async isExamAccepted(id) {
    const sql = `SELECT id FROM reservations WHERE id = ? AND status IN ("مقبول", "محول") LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }

  async findByReservationId(reservationId) {
    const sql = `SELECT * FROM transfers WHERE reservation_id = ? LIMIT 1`;
    return await queryOne(sql, [reservationId]);
  }

  async create(data = null) {
    const reservationId = data?.reservation_id ?? this.reservation_id;
    const hospitalId = data?.hospital_id ?? this.hospital_id ?? null;
    const transferReason = data?.transfer_reason ?? this.transfer_reason;
    const notes = data?.notes ?? this.notes ?? null;
    const status = data?.status ?? this.status ?? "pending";

    const sql = `
      INSERT INTO transfers (reservation_id, hospital_id, transfer_reason, notes, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    return await query(sql, [
      reservationId,
      hospitalId,
      transferReason,
      notes,
      status,
    ]);
  }

  async assignHospital(id, { hospital_id, notes }) {
    const sql = `
      UPDATE transfers 
      SET hospital_id = ?, 
          notes = COALESCE(?, notes), 
          status = 'completed', 
          updated_at = NOW() 
      WHERE id = ?
    `;
    return await query(sql, [hospital_id, notes ?? null, id]);
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.transfer_reason !== undefined) {
      fields.push("transfer_reason = ?");
      values.push(data.transfer_reason);
    }
    if (data.hospital_id !== undefined) {
      fields.push("hospital_id = ?");
      values.push(data.hospital_id);
    }
    if (data.notes !== undefined) {
      fields.push("notes = ?");
      values.push(data.notes);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE transfers SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
    return await query(sql, values);
  }

  async getTransferDetails(id) {
    const sql = `
      SELECT 
        transfers.id AS transfer_id,
        transfers.reservation_id,
        transfers.hospital_id,
        transfers.transfer_reason,
        transfers.notes,
        transfers.status AS transfer_status,
        transfers.created_at AS transfer_created_at,
        reservations.status AS reservation_status,
        reservations.date AS reservation_date,
        reservations.exam_type,
        reservations.patient_name,
        reservations.national_id AS patient_national_id,
        reservations.phone_number AS patient_phone_number,
        users.id AS user_id,
        users.username,
        users.email,
        users.phone_number AS user_phone,
        users.user_image_path,
        external_hospitals.hospital_name,
        clinics.clinic_name,
        levels.level_name
      FROM transfers
      JOIN reservations ON transfers.reservation_id = reservations.id
      LEFT JOIN users ON reservations.user_id = users.id
      LEFT JOIN clinics ON reservations.clinic_id = clinics.id
      LEFT JOIN levels ON users.level_id = levels.id
      LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      WHERE transfers.id = ?
      LIMIT 1
    `;
    return await queryOne(sql, [id]);
  }

  async index(params = {}) {
    const conditions = [
      `(reservations.status = "مقبول" OR reservations.status = "محول")`,
    ];

    if (params.status) {
      const sanitizedStatus = String(params.status).replace(/[^a-zA-Z0-9_-]/g, "");
      if (sanitizedStatus) {
        conditions.push(`transfers.status = '${sanitizedStatus}'`);
      }
    }

    const baseWhere = conditions.join(" AND ");

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
        "transfers.status",
      ],
      baseWhere,
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
        reservations.status AS reservation_status,
        reservations.patient_name,
        reservations.national_id AS patient_national_id,
        reservations.phone_number AS patient_phone_number,
        clinics.clinic_name,
        levels.level_name,
        users.id AS user_id,
        users.id AS student_id,
        COALESCE(users.username, reservations.patient_name) AS user_name,
        COALESCE(users.username, reservations.patient_name) AS student_name,
        users.email AS user_email,
        users.email AS student_email,
        users.user_image_path,
        transfers.id AS transfer_id,
        transfers.hospital_id,
        transfers.transfer_reason,
        transfers.notes,
        transfers.status AS transfer_status,
        transfers.created_at AS transfer_created_at,
        external_hospitals.hospital_name AS transfered_to
      `,
      orderBy: "transfers.id DESC",
    });
  }
}

export default Transfer;
