import bcrypt from "bcrypt";
import crypto from "crypto";

import UserRepo from "../../../repositories/user.repository.js";
import PasswordResetRepo from "./password-reset.repository.js";
import * as emailService from "../services/email.service.js";

// IMPORT UTILITIES
import ApiError from "../../../utils/api-error.js";
import { StatusCode } from "../../../utils/status-codes.js";
import { UserType } from "../../../utils/user-types.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

const isOtpExpired = (expiresAt) => new Date(expiresAt).getTime() <= Date.now();

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const getRemainingCooldownSeconds = (lastSentAt) => {
  const cooldownEndsAt =
    new Date(lastSentAt).getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
  const remainingMs = cooldownEndsAt - Date.now();
  return Math.max(Math.ceil(remainingMs / 1000), 0);
};

export const sendPasswordResetOtp = async (email) => {
  const passwordResetRepo = new PasswordResetRepo();

  // 1. clean consumed and expired otps
  await passwordResetRepo.cleanupConsumedAndExpiredOtps();

  // 2. check if email exist
  const student = await new UserRepo().findByEmail(UserType.STUDENT, email);
  if (!student) {
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  }
  // 3. check if otp exist
  const existingOtp = await passwordResetRepo.findOtpByEmail(email);

  // 4. check if otp expired
  if (
    existingOtp &&
    !existingOtp.used &&
    !isOtpExpired(existingOtp.expires_at)
  ) {
    const remaining = getRemainingCooldownSeconds(existingOtp.last_sent_at);
    if (remaining > 0) {
      throw new ApiError(
        `Please wait ${remaining} seconds before requesting another OTP`,
        StatusCode.TOO_MANY_REQUESTS,
      );
    }
  }

  // 5. generate otp
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 6. add otp data to password_reset_otps table
  await passwordResetRepo.upsertOtp(email, otpHash, expiresAt);

  // 7. send otp via email
  try {
    await emailService.sendOtpMail(student, otp);
  } catch (error) {
    await passwordResetRepo.invalidateOtp(email);
    throw new ApiError(
      "Failed to send OTP email. Please try again.",
      StatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    message: `OTP sent successfully. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  };
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const passwordResetRepo = new PasswordResetRepo();
  otp = String(otp);

  // 1. check if email exist
  const student = await new UserRepo().findByEmail(UserType.STUDENT, email);
  if (!student) {
    throw new ApiError("User not found", StatusCode.NOT_FOUND);
  }

  // 2. check if otp exist
  const otpRecord = await passwordResetRepo.findOtpByEmail(email);
  if (!otpRecord || otpRecord.used) {
    throw new ApiError("Invalid OTP", StatusCode.BAD_REQUEST);
  }

  // 3. handling otp expiration
  if (isOtpExpired(otpRecord.expires_at)) {
    await passwordResetRepo.invalidateOtp(email);
    throw new ApiError(
      "OTP has expired. Please request a new OTP.",
      StatusCode.BAD_REQUEST,
    );
  }

  // 4. handling too many otp requests
  if (otpRecord.attempts_count >= OTP_MAX_ATTEMPTS) {
    await passwordResetRepo.invalidateOtp(email);
    throw new ApiError(
      "Too many invalid OTP attempts. Please request a new OTP.",
      StatusCode.TOO_MANY_REQUESTS,
    );
  }

  if (typeof otpRecord.otp_hash !== "string" || !otpRecord.otp_hash) {
    throw new ApiError("Invalid OTP", StatusCode.BAD_REQUEST);
  }

  const otpMatched = await bcrypt.compare(otp, otpRecord.otp_hash);

  if (!otpMatched) {
    await passwordResetRepo.incrementAttempts(email);

    const remainingAttempts = OTP_MAX_ATTEMPTS - (otpRecord.attempts_count + 1);

    if (remainingAttempts <= 0) {
      await passwordResetRepo.invalidateOtp(email);
      throw new ApiError(
        "Too many invalid OTP attempts. Please request a new OTP.",
        StatusCode.TOO_MANY_REQUESTS,
      );
    }

    throw new ApiError(
      `Invalid OTP. ${remainingAttempts} attempt(s) left.`,
      StatusCode.BAD_REQUEST,
    );
  }

  // 5. handle entering same password
  if (typeof student.password !== "string" || !student.password) {
    throw new ApiError(
      "Password reset is unavailable for this account.",
      StatusCode.BAD_REQUEST,
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, student.password);
  if (isSamePassword) {
    throw new ApiError(
      "New password must be different from current password.",
      StatusCode.BAD_REQUEST,
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await passwordResetRepo.updatePasswordAndConsumeOtp(email, hashedPassword);
  return { message: "Password changed successfully" };
};
