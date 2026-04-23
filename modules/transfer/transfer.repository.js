// repositories/transfer.repository.js

import { query } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Transfer extends Base {
  constructor(medical_exam_id, hospital_id, transfer_reason, notes) {
    super("transfers");
    this.medical_exam_id = medical_exam_id;
    this.hospital_id = hospital_id;
    this.transfer_reason = transfer_reason;
    this.notes = notes;
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
}

export default Transfer;
