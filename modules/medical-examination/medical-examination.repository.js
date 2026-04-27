import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class MedicalExamination extends Base {
  constructor() {
    super("medical_examinations");
  }
  async isAccepted(id) {
    const sql = `SELECT * FROM medical_examinations WHERE id = ? AND status = "مقبول" LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }

  async index(params) {
    return super.index({
      ...params,
      searchableColumns: [
        "medical_examinations.exam_type",
        "students.username",
        "students.email",
        "clinics.clinic_name",
        "levels.level_name",
        "transfers.transfer_reason",
        "external_hospitals.hospital_name",
      ],
      baseWhere: `medical_examinations.status = "مقبول"`,
      joins: `
      LEFT JOIN students ON medical_examinations.student_id = students.id
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      LEFT JOIN levels ON students.level_id = levels.id
      LEFT JOIN transfers ON transfers.medical_exam_id = medical_examinations.id
      LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
    `,
      select: `
      medical_examinations.id,
      medical_examinations.exam_type,
      medical_examinations.date,
      clinics.clinic_name,
      levels.level_name,
      students.id AS student_id,
      students.username AS student_name,
      students.email AS student_email,
      transfers.id AS transfer_id,
      transfers.transfer_reason,
      external_hospitals.hospital_name AS transfered_to
    `,
      orderBy: "medical_examinations.id DESC",
    });
  }
}

export default MedicalExamination;
