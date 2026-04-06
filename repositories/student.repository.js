import { query, queryOne, transaction } from "../config/db-helpers.js";

class StudentRepo {
  async verfied(email) {
    const sql = `SELECT verified FROM students WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return !!result;
  }
  async create(studentData) {
    const sql = `
      INSERT INTO students 
      (
        username,
        email,
        password,
        national_id,
        nationality_id,
        level_id,
        gov_id,
        faculty_id,
        gender,
        birth_date,
        phone_number,
        user_image_file,
        national_id_file,
        fees_file
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      studentData.username,
      studentData.email,
      studentData.password,
      studentData.national_id,
      studentData.nationality_id,
      studentData.level_id,
      studentData.gov_id,
      studentData.faculty_id,
      studentData.gender,
      studentData.birth_date,
      studentData.phone_number,
      studentData.user_image_file,
      studentData.national_id_file,
      studentData.fees_file,
    ];

    const result = await query(sql, params);

    return result;
  }
}

export default StudentRepo;
