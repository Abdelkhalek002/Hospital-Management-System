import { query, queryOne, transaction } from "../../../../config/db-helpers.js";

class Transfer {
  constructor(medical_exam_id, hospital_id, transfer_reason, notes) {
    this.medical_exam_id = medical_exam_id;
    this.hospital_id = hospital_id;
    this.transfer_reason = transfer_reason;
    this.notes = notes;
  }
  async create() {
    const sql = `INSERT INTO transfers (medical_exam_id, hospital_id, transfer_reason, notes) VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [
      this.medical_exam_id,
      this.hospital_id,
      this.transfer_reason,
      this.notes,
    ]);
    return result;
  }
}

export default Transfer;
