import { query, queryOne, transaction } from "../config/db-helpers.js";

class Base {
  constructor(tableName) {
    this.table = tableName;
  }

  async execute(sql, params = []) {
    return await query(sql, params);
  }

  async existsByField(field, value) {
    const sql = `SELECT 1 FROM ${this.table} WHERE ${field} = ? LIMIT 1`;
    const result = await queryOne(sql, [value]);
    return !!result;
  }

  async findById(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`;
    const result = await queryOne(sql, [id]);
    return result;
  }

  buildPagination(page = 1, limit = 10) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const offset = (safePage - 1) * safeLimit;

    return { page: safePage, limit: safeLimit, offset };
  }

  async paginate({ countSql, dataSql, params = [], page, limit }) {
    const { offset, limit: safeLimit } = this.buildPagination(page, limit);

    const countResult = await this.execute(countSql, params);
    const totalCount = countResult[0].count;

    if (!totalCount) {
      return { totalCount: 0, totalPages: 0, data: [] };
    }

    const totalPages = Math.ceil(totalCount / safeLimit);

    const data = await this.execute(dataSql, [...params, safeLimit, offset]);

    return {
      totalCount,
      totalPages,
      data,
    };
  }

  buildSearch(columns = [], searchKey = "") {
    if (!searchKey || columns.length === 0) {
      return { clause: "1=1", params: [] };
    }

    const like = `%${searchKey}%`;

    return {
      clause: "(" + columns.map((c) => `${c} LIKE ?`).join(" OR ") + ")",
      params: columns.map(() => like),
    };
  }
  async getStats() {
    const labels = {
      usersCount: "Total users",
      reservationsCount: "Total reservations",
      clinicsCount: "Clinics",
      adminsCount: "Total admins",
      superAdminsCount: "Total super admins",
      avgReservationsPerUser: "Reservations average per user",
      avgReservationsPerClinic: "Reservations average per clinic",
      mostReservedClinic: "Most reserved clinic",
    };

    const statsRow = await transaction(async (connection) => {
      const execOne = async (sql, params = []) => {
        const [rows] = await connection.execute(sql, params);
        return rows.length > 0 ? rows[0] : null;
      };

      const sql = `
        SELECT
          (SELECT COUNT(*) FROM students) AS usersCount,
          (SELECT COUNT(*) FROM medical_examinations) AS reservationsCount,
          (SELECT COUNT(*) FROM clinics) AS clinicsCount,
          (SELECT COUNT(*) FROM admins) AS adminsCount,
          (SELECT COUNT(*) FROM super_admins) AS superAdminsCount,
          (
            SELECT AVG(reservationsCount)
            FROM (
              SELECT COUNT(*) AS reservationsCount
              FROM medical_examinations
              GROUP BY student_id
            ) AS reservationsPerUser
          ) AS avgReservationsPerUser,
          (
            SELECT AVG(reservationsCount)
            FROM (
              SELECT COUNT(*) AS reservationsCount
              FROM medical_examinations
              GROUP BY clinic_id
            ) AS reservationsPerClinic
          ) AS avgReservationsPerClinic,
          mostReserved.clinic_name AS mostReservedClinicName,
          mostReserved.value AS mostReservedClinicValue
        FROM (SELECT 1) AS dummy
        LEFT JOIN (
          SELECT clinics.clinic_name, COUNT(*) AS value
          FROM medical_examinations
          JOIN clinics ON medical_examinations.clinic_id = clinics.id
          GROUP BY medical_examinations.clinic_id
          ORDER BY value DESC
          LIMIT 1
        ) AS mostReserved ON 1=1
      `;

      return await execOne(sql);
    });

    if (!statsRow) return [];

    return [
      { label: labels.superAdminsCount, value: statsRow.superAdminsCount },
      { label: labels.adminsCount, value: statsRow.adminsCount },
      { label: labels.usersCount, value: statsRow.usersCount },
      { label: labels.reservationsCount, value: statsRow.reservationsCount },
      { label: labels.clinicsCount, value: statsRow.clinicsCount },
      {
        label: labels.avgReservationsPerUser,
        value: statsRow.avgReservationsPerUser,
      },
      {
        label: labels.avgReservationsPerClinic,
        value: statsRow.avgReservationsPerClinic,
      },
      {
        label: labels.mostReservedClinic,
        clinic: statsRow.mostReservedClinicName,
        value: statsRow.mostReservedClinicValue,
      },
    ];
  }
}

export default Base;
