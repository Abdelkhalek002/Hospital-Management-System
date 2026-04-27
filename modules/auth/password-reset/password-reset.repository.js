import { query, queryOne, transaction } from "../../../config/db-helpers.js";

class PasswordResetRepo {
  async findOtpByEmail(email) {
    const sql = `
      SELECT email, otp_hash, expires_at, attempts_count, used, last_sent_at
      FROM password_reset_otps
      WHERE email = ?
      LIMIT 1
    `;
    return await queryOne(sql, [email]);
  }

  async upsertOtp(email, otpHash, expiresAt) {
    const sql = `
      INSERT INTO password_reset_otps (email, otp_hash, expires_at, attempts_count, used, last_sent_at)
      VALUES (?, ?, ?, 0, 0, NOW())
      ON DUPLICATE KEY UPDATE
        otp_hash = VALUES(otp_hash),
        expires_at = VALUES(expires_at),
        attempts_count = 0,
        used = 0,
        last_sent_at = NOW(),
        updated_at = NOW()
    `;
    await query(sql, [email, otpHash, expiresAt]);
  }

  async incrementAttempts(email) {
    const sql = `
      UPDATE password_reset_otps
      SET attempts_count = attempts_count + 1, updated_at = NOW()
      WHERE email = ? AND used = 0
    `;
    await query(sql, [email]);
  }

  async invalidateOtp(email) {
    const sql = `
      UPDATE password_reset_otps
      SET used = 1, updated_at = NOW()
      WHERE email = ?
    `;
    await query(sql, [email]);
  }

  async cleanupConsumedAndExpiredOtps() {
    const sql = `
      DELETE FROM password_reset_otps
      WHERE used = 1 OR expires_at < NOW()
    `;
    await query(sql);
  }

  async updatePasswordAndConsumeOtp(email, hashedPassword) {
    await transaction(async (connection) => {
      await connection.execute(
        "UPDATE students SET password = ?, password_changed_at = NOW() WHERE email = ?",
        [hashedPassword, email],
      );
      await connection.execute(
        `UPDATE password_reset_otps SET used = 1, updated_at = NOW() WHERE email = ?`,
        [email],
      );
    });
  }
}

export default PasswordResetRepo;
