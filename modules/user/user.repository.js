import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";

class UserRepository extends Base {
  constructor(type = "users") {
    const resolvedTable =
      type === "students" || type === "users"
        ? "users"
        : type === "super_admins" || type === "admins"
          ? "admins"
          : "users";
    super(resolvedTable);
    this.type = resolvedTable;
  }

  // --- Auth, Verification & Online Status ---

  async isVerified(email) {
    const sql = `SELECT verified FROM users WHERE email = ? LIMIT 1`;
    const result = await queryOne(sql, [email]);
    return Boolean(result?.verified);
  }

  async isVerfied(email) {
    return await this.isVerified(email);
  }

  async activateEmail(email) {
    const sql = `UPDATE users SET verified = 1 WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return result;
  }

  async deActivateEmail(email) {
    const sql = `UPDATE users SET verified = 0 WHERE email = ?`;
    const result = await queryOne(sql, [email]);
    return result;
  }

  async setOnline(id) {
    if (this.table === "admins") {
      const sql = `UPDATE admins SET status = 'active' WHERE id = ?`;
      const result = await queryOne(sql, [id]);
      return !!result;
    }
    const sql = `UPDATE users SET is_active = 1 WHERE id = ?`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }

  async setOffline(typeOrId, optionalId) {
    const id = optionalId !== undefined ? optionalId : typeOrId;
    const targetTable = optionalId !== undefined ? typeOrId : this.table;

    if (targetTable === "admins" || targetTable === "super_admins") {
      const sql = `UPDATE admins SET status = 'inactive' WHERE id = ?`;
      const result = await queryOne(sql, [id]);
      return !!result;
    }
    const sql = `UPDATE users SET is_active = 0 WHERE id = ?`;
    const result = await queryOne(sql, [id]);
    return !!result;
  }

  async findByEmail(email) {
    if (this.table === "admins") {
      const sql = `SELECT username, email, password, role, id, password_changed_at, status, profile_photo_path FROM admins WHERE email = ? LIMIT 1`;
      return await queryOne(sql, [email]);
    }

    // Default to users table
    const sql = `SELECT username, email, password, id, password_changed_at, verified, is_active, document_status, rejection_reason FROM users WHERE email = ? LIMIT 1`;
    const user = await queryOne(sql, [email]);
    if (user) return user;

    // Fallback: check admins if not found in users
    const adminSql = `SELECT username, email, password, role, id, password_changed_at, status, profile_photo_path FROM admins WHERE email = ? LIMIT 1`;
    return await queryOne(adminSql, [email]);
  }

  // --- CRUD Operations for Users ---

  async create(userData) {
    const sql = `
      INSERT INTO users 
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
        user_image_path,
        national_id_path,
        fees_path
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userData.username,
      userData.email,
      userData.password,
      String(userData.national_id),
      userData.nationality_id,
      userData.level_id,
      userData.gov_id,
      userData.faculty_id,
      userData.gender,
      userData.birth_date,
      userData.phone_number,
      userData.user_image_path || userData.user_image_file,
      userData.national_id_path || userData.national_id_file,
      userData.fees_path || userData.fees_file,
    ];

    const result = await query(sql, params);
    return result;
  }

  async getOne(id) {
    const sql = `SELECT 
                  u.id, u.username, u.email,
                  u.user_image_path AS photo,
                  u.user_image_path,
                  u.user_image_path AS user_image_file,
                  u.national_id_path,
                  u.national_id_path AS national_id_file,
                  u.fees_path,
                  u.fees_path AS fees_file,
                  u.phone_number, u.national_id, u.gender,
                  u.birth_date, u.is_active, u.verified,
                  u.document_status, u.rejection_reason, u.reviewed_by, u.reviewed_at,
                  u.level_id, u.faculty_id, u.gov_id, u.nationality_id,
                  l.level_name AS level, l.level_name,
                  f.faculty_name AS faculty, f.faculty_name,
                  g.gov_name AS governorate, g.gov_name,
                  n.nationality_name AS nationality, n.nationality_name,
                  u.created_at, u.updated_at
                  FROM users u
                    LEFT JOIN levels l         ON u.level_id = l.id
                    LEFT JOIN governorates g   ON u.gov_id = g.id
                    LEFT JOIN nationality n    ON u.nationality_id = n.id
                    LEFT JOIN faculties f      ON u.faculty_id = f.id
                  WHERE u.id = ?;`;
    const result = await queryOne(sql, [id]);
    return result;
  }

  async getAll(searchKey, searchValue, documentStatus = null, filters = {}) {
    let sql = `SELECT 
                  u.id, u.username, u.email,
                  u.user_image_path AS photo,
                  u.user_image_path,
                  u.user_image_path AS user_image_file,
                  u.national_id_path,
                  u.national_id_path AS national_id_file,
                  u.fees_path,
                  u.fees_path AS fees_file,
                  u.phone_number, u.national_id, u.gender,
                  u.birth_date, u.is_active, u.verified,
                  u.document_status, u.rejection_reason, u.reviewed_by, u.reviewed_at,
                  u.level_id, u.faculty_id, u.gov_id, u.nationality_id,
                  l.level_name AS level, l.level_name,
                  f.faculty_name AS faculty, f.faculty_name,
                  g.gov_name AS governorate, g.gov_name,
                  n.nationality_name AS nationality, n.nationality_name,
                  u.created_at, u.updated_at
                  FROM users u
                    LEFT JOIN levels l         ON u.level_id = l.id
                    LEFT JOIN governorates g   ON u.gov_id = g.id
                    LEFT JOIN nationality n    ON u.nationality_id = n.id
                    LEFT JOIN faculties f      ON u.faculty_id = f.id`;
    const params = [];
    const whereClauses = [];

    if (searchKey && searchValue) {
      whereClauses.push(`u.${searchKey} LIKE ?`);
      params.push(`%${searchValue}%`);
    }

    if (documentStatus) {
      whereClauses.push(`u.document_status = ?`);
      params.push(documentStatus);
    }

    if (filters?.faculty_id) {
      whereClauses.push(`u.faculty_id = ?`);
      params.push(filters.faculty_id);
    }

    if (filters?.level_id) {
      whereClauses.push(`u.level_id = ?`);
      params.push(filters.level_id);
    }

    if (filters?.gender) {
      whereClauses.push(`u.gender = ?`);
      params.push(filters.gender);
    }

    if (filters?.nationality_id) {
      whereClauses.push(`u.nationality_id = ?`);
      params.push(filters.nationality_id);
    }

    if (filters?.date) {
      whereClauses.push(`DATE(u.created_at) = ?`);
      params.push(filters.date);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    sql += ` ORDER BY u.id DESC;`;
    return await query(sql, params);
  }

  async updateDocumentStatus(id, { status, rejectionReason = null, reviewedBy = null }) {
    let sql;
    let params;

    if (status === "approved") {
      sql = `UPDATE users 
             SET document_status = 'approved', is_active = 1, rejection_reason = NULL, reviewed_by = ?, reviewed_at = NOW() 
             WHERE id = ?`;
      params = [reviewedBy, id];
    } else if (status === "rejected") {
      sql = `UPDATE users 
             SET document_status = 'rejected', is_active = 0, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW() 
             WHERE id = ?`;
      params = [rejectionReason, reviewedBy, id];
    } else {
      sql = `UPDATE users 
             SET document_status = 'pending', is_active = 0, rejection_reason = NULL, reviewed_by = NULL, reviewed_at = NULL 
             WHERE id = ?`;
      params = [id];
    }

    const result = await query(sql, params);
    return result;
  }

  async updateOne(id, data) {
    const updates = [];
    const values = [];

    const cleanData = { ...data };
    if ("user_profile_photo" in cleanData && !("user_image_path" in cleanData)) {
      cleanData.user_image_path = cleanData.user_profile_photo;
      delete cleanData.user_profile_photo;
    }
    if ("user_image_file" in cleanData && !("user_image_path" in cleanData)) {
      cleanData.user_image_path = cleanData.user_image_file;
      delete cleanData.user_image_file;
    }
    if ("national_id_file" in cleanData && !("national_id_path" in cleanData)) {
      cleanData.national_id_path = cleanData.national_id_file;
      delete cleanData.national_id_file;
    }
    if ("fees_file" in cleanData && !("fees_path" in cleanData)) {
      cleanData.fees_path = cleanData.fees_file;
      delete cleanData.fees_file;
    }

    Object.keys(cleanData).forEach((field) => {
      updates.push(`${field} = ?`);
      values.push(cleanData[field] ?? null);
    });

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    const result = await query(sql, values);
    return result;
  }
}

export default UserRepository;
