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

  async index({ page, limit, searchKey }) {
    const search = this.buildSearch(
      [
        "medical_examinations.exam_type",
        "students.username",
        "students.email",
        "clinics.clinic_name",
        "levels.level_name",
        "transfers.transfer_reason",
        "external_hospitals.hospital_name",
      ],
      searchKey,
    );

    const whereClause = `
      medical_examinations.status = "مقبول"
      AND ${search.clause}
    `;

    const params = [...search.params];

    const countSql = `
      SELECT COUNT(*) AS count
      FROM medical_examinations
      LEFT JOIN students ON medical_examinations.student_id = students.id
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      LEFT JOIN levels ON students.level_id = levels.id
      LEFT JOIN transfers ON transfers.medical_exam_id = medical_examinations.id
      LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      WHERE ${whereClause}
    `;

    const dataSql = `
      SELECT 
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

      FROM medical_examinations
      LEFT JOIN clinics ON medical_examinations.clinic_id = clinics.id
      LEFT JOIN students ON medical_examinations.student_id = students.id
      LEFT JOIN levels ON students.level_id = levels.id
      LEFT JOIN transfers ON transfers.medical_exam_id = medical_examinations.id
      LEFT JOIN external_hospitals ON transfers.hospital_id = external_hospitals.id
      WHERE ${whereClause}
      ORDER BY medical_examinations.id DESC
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

export default MedicalExamination;
