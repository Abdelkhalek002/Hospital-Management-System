import { query, queryOne, transaction } from "../../../config/db-helpers.js";

class EmailVerificationRepo {
  async findOtpByEmail(email) {
    const sql = `
      SELECT email, otp_hash, expires_at, attempts_count, used, last_sent_at
      FROM email_verification_otps
      WHERE email = ?
      LIMIT 1
    `;
    return await queryOne(sql, [email]);
  }

  async upsertOtp(email, otpHash, expiresAt) {
    const sql = `
      INSERT INTO email_verification_otps (email, otp_hash, expires_at, attempts_count, used, last_sent_at)
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
      UPDATE email_verification_otps
      SET attempts_count = attempts_count + 1, updated_at = NOW()
      WHERE email = ? AND used = 0
    `;
    await query(sql, [email]);
  }

  async invalidateOtp(email) {
    const sql = `
      UPDATE email_verification_otps
      SET used = 1, updated_at = NOW()
      WHERE email = ?
    `;
    await query(sql, [email]);
  }

  async cleanupConsumedAndExpiredOtps() {
    const sql = `
      DELETE FROM email_verification_otps
      WHERE used = 1 OR expires_at < NOW()
    `;
    await query(sql);
  }

  async activateUserAndConsumeOtp(email) {
    return await transaction(async (connection) => {
      const [userResult] = await connection.execute(
        "UPDATE users SET verified = 1, is_active = 0, document_status = 'pending' WHERE email = ?",
        [email],
      );

      await connection.execute(
        "UPDATE email_verification_otps SET used = 1, updated_at = NOW() WHERE email = ?",
        [email],
      );

      return userResult.affectedRows > 0;
    });
  }
}

export default EmailVerificationRepo;
