import bcrypt from "bcrypt";
import crypto from "crypto";

// IMPORT REPOSITORIES
import BaseRepo from "../../../repositories/base.repository.js";
import AuthRepo from "../repositories/auth.repository.js";
import PasswordResetRepo from "../repositories/password-reset.repository.js";
import StudentRepo from "../../../repositories/student.repository.js";
import UserRepo from "../../../repositories/user.repository.js";

// IMPORT SERVICES
import { signToken } from "./jwt.service.js";
import * as emailService from "../services/email.service.js";

// IMPORT UTILITIES
import ApiError from "../../../utils/api-error.js";
import { StatusCode } from "../../../utils/status-codes.js";
import { UserType } from "../../../utils/user-types.js";

const checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const signup = async (studentData) => {
  //1. check if (email, national_id, phone_number) existes
  const baseRepo = new BaseRepo();
  const studentRepo = new StudentRepo();

  const emailExists = await baseRepo.existsByField(
    "students",
    "email",
    studentData.email,
  );
  if (emailExists) throw new ApiError("Email already exists");

  const nationalIdExists = await baseRepo.existsByField(
    "students",
    "national_id",
    studentData.national_id,
  );
  if (nationalIdExists) throw new ApiError("National ID already exists");
  const phoneNumberExists = await baseRepo.existsByField(
    "students",
    "phone_number",
    String(studentData.phone_number),
  );
  if (phoneNumberExists) throw new ApiError("Phone number already exists");

  //2. hash password
  const hashedPassword = await bcrypt.hash(studentData.password, 12);

  //3. build final payload
  const finalStudentData = {
    ...studentData,
    password: hashedPassword,
  };

  //4. create the student
  const newUser = await studentRepo.create(finalStudentData);

  //5. send activation email
  await emailService.sendActivationMail(finalStudentData);

  //6. create a new token
  const token = signToken(
    { ...newUser, userType: UserType.STUDENT },
    process.env.JWT_EXPIRE_TIME,
  );

  // 7. Change status to online
  //await userRepo.setOnline(UserType.STUDENT, newUser.id);
  const result = { newUser, token };

  return result;
};

export const performLogin = async (userType, email, password) => {
  // 1. Validate userType
  if (!Object.values(UserType).includes(userType)) {
    throw new ApiError("Invalid user type", StatusCode.BAD_REQUEST);
  }
  const authRepo = new AuthRepo();
  const userRepo = new UserRepo();

  // 2. Check email existence
  const user = await authRepo.findByEmailForAuth(userType, email);
  if (!user) throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);

  // 3. Compare passwords
  const matched = await checkPassword(password, user.password);
  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);

  // 4. Sign token
  const token = signToken({ ...user, userType }, process.env.JWT_EXPIRE_TIME);
  const result = { user, token };

  // 5. Change status to online
  await userRepo.setOnline(userType, user.id);

  return result;
};

export const logout = async ({ res, userType, userId, clearCookieOptions }) => {
  const userRepo = new UserRepo();
  res.clearCookie("jwt", clearCookieOptions);
  if (userType && userId) {
    await userRepo.setOffline(userType, userId);
  }
};

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
  //newPassword = String(newPassword);

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
