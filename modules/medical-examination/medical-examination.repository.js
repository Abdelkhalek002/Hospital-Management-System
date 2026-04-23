import { query, queryOne, transaction } from "../../config/db-helpers.js";

class MedicalExamination {
  async isAccepted(id) {
    const sql = `SELECT * FROM medical_examinations WHERE id = ? AND status = "مقبول" LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }
}

export default MedicalExamination;
