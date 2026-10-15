import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class Student extends Base {
  constructor() {
    super("students");
  }
  async isVerfied(email) {
    const sql = `SELECT verified FROM students WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return Boolean(result?.verified);
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
  async getOne(id) {
    const sql = `SELECT 
                  s.id, s.username, s.email, s.user_image_file AS photo,
                  s.user_image_file, s.national_id_file, s.fees_file,
                  s.phone_number, s.national_id, s.gender,
                  s.birth_date, s.is_active, s.verified,
                  s.level_id, s.faculty_id, s.gov_id, s.nationality_id,
                  l.level_name AS level, l.level_name,
                  f.faculty_name AS faculty, f.faculty_name,
                  g.gov_name AS governorate, g.gov_name,
                  n.nationality_name AS nationality, n.nationality_name,
                  s.created_at, s.updated_at
                  FROM students s
                    LEFT JOIN levels l         ON s.level_id = l.id
                    LEFT JOIN governorates g   ON s.gov_id = g.id
                    LEFT JOIN nationality n    ON s.nationality_id = n.id
                    LEFT JOIN faculties f      ON s.faculty_id = f.id
                  WHERE s.id = ?;`;
    const result = await queryOne(sql, [id]);
    return result;
  }
  async getAll(searchKey, searchValue) {
    let sql = `SELECT 
                  s.id, s.username, s.email, s.user_image_file AS photo,
                  s.user_image_file, s.national_id_file, s.fees_file,
                  s.phone_number, s.national_id, s.gender,
                  s.birth_date, s.is_active, s.verified,
                  s.level_id, s.faculty_id, s.gov_id, s.nationality_id,
                  l.level_name AS level, l.level_name,
                  f.faculty_name AS faculty, f.faculty_name,
                  g.gov_name AS governorate, g.gov_name,
                  n.nationality_name AS nationality, n.nationality_name,
                  s.created_at, s.updated_at
                  FROM students s
                    LEFT JOIN levels l         ON s.level_id = l.id
                    LEFT JOIN governorates g   ON s.gov_id = g.id
                    LEFT JOIN nationality n    ON s.nationality_id = n.id
                    LEFT JOIN faculties f      ON s.faculty_id = f.id`;
    const params = [];
    if (searchKey && searchValue) {
      sql += ` WHERE s.${searchKey} LIKE ?`;
      params.push(`%${searchValue}%`);
    }
    sql += ` ORDER BY s.id DESC;`;
    return await query(sql, params);
  }
  async updateOne(id, data) {
    const updates = [];
    const values = [];

    Object.keys(data).forEach((field) => {
      updates.push(`${field} = ?`);
      values.push(data[field] ?? null);
    });

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE students SET ${updates.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);
    return result;
  }
}

export default Student;
