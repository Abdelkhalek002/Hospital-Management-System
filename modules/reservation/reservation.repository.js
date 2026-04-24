import { query, queryOne, transaction } from "../../config/db-helpers.js";
import Base from "../../repositories/base.repository.js";
import { roles } from "../../utils/roles.js";
class Reservation extends Base {
  constructor() {
    super("medical_examinations");
  }
  async getPerMonth() {
    const sql = `
    WITH RECURSIVE Months AS (
      SELECT 1 AS month
      UNION ALL
      SELECT month + 1 FROM Months WHERE month < 12
    )
    SELECT 
      CASE Months.month
        WHEN 1 THEN 'January'
        WHEN 2 THEN 'February'
        WHEN 3 THEN 'March'
        WHEN 4 THEN 'April'
        WHEN 5 THEN 'May'
        WHEN 6 THEN 'June'
        WHEN 7 THEN 'July'
        WHEN 8 THEN 'August'
        WHEN 9 THEN 'September'
        WHEN 10 THEN 'October'
        WHEN 11 THEN 'November'
        WHEN 12 THEN 'December'
      END AS month_name, 
      COALESCE(COUNT(medical_examinations.id), 0) AS reservationsCount
    FROM Months
    LEFT JOIN medical_examinations ON MONTH(medical_examinations.date) = Months.month AND YEAR(medical_examinations.date) = YEAR(CURDATE())
    GROUP BY Months.month;
  `;
    const results = await query(sql);
    const months = results.map((row) => {
      return {
        month: row.month_name,
        reservations: row.reservationsCount,
      };
    });
    return months;
  }
  async accept(id) {
    const sql = `UPDATE medical_examinations SET status = "مقبول"  WHERE id = ?`;
    const result = await query(sql, [id]);
    return !!result;
  }
  async decline(id) {
    const sql = `UPDATE medical_examinations SET status = "مرفوض"  WHERE id = ?`;
    const result = await query(sql, [id]);
    return !!result;
  }
}
export default Reservation;
