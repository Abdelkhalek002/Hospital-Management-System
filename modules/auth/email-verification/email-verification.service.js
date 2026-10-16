import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../../user/user.repository.js";
import EmailVerificationRepo from "./email-verification.repository.js";
import * as emailService from "../../../services/email.service.js";
import { signToken } from "../jwt.service.js";

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

export const sendVerificationOtp = async (email) => {
  const emailVerificationRepo = new EmailVerificationRepo();

  // 1. clean consumed and expired otps
  await emailVerificationRepo.cleanupConsumedAndExpiredOtps();

  // 2. check if user exists
  const user = await new User(UserType.USER).findByEmail(email);
  if (!user) {
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  }

  // 3. check if already verified
  if (user.verified) {
    throw new ApiError("الحساب مفعل بالفعل", StatusCode.BAD_REQUEST);
  }

  // 4. check cooldown
  const existingOtp = await emailVerificationRepo.findOtpByEmail(email);
  if (
    existingOtp &&
    !existingOtp.used &&
    !isOtpExpired(existingOtp.expires_at)
  ) {
    const remaining = getRemainingCooldownSeconds(existingOtp.last_sent_at);
    if (remaining > 0) {
      throw new ApiError(
        `يرجى الانتظار ${remaining} ثانية قبل إعادة إرسال رمز التحقق`,
        StatusCode.TOO_MANY_REQUESTS,
      );
    }
  }

  // 5. generate and hash otp
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 6. store otp in db
  await emailVerificationRepo.upsertOtp(email, otpHash, expiresAt);

  // 7. send otp via gmail
  try {
    await emailService.sendActivationOtpMail(user, otp);
  } catch (error) {
    console.error("Failed to send activation email:", error);
    await emailVerificationRepo.invalidateOtp(email);
    throw new ApiError(
      "فشل في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقاً.",
      StatusCode.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    message: `تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني. صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق.`,
    email,
  };
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const emailVerificationRepo = new EmailVerificationRepo();
  otp = String(otp || "").trim();

  // 1. check if user exists
  const userRepo = new User(UserType.USER);
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  }

  if (user.verified) {
    throw new ApiError("تم تفعيل هذا الحساب بالفعل، يمكنك تسجيل الدخول مباشرة", StatusCode.BAD_REQUEST);
  }

  // 2. check otp record
  const otpRecord = await emailVerificationRepo.findOtpByEmail(email);
  if (!otpRecord || otpRecord.used) {
    throw new ApiError("رمز التحقق غير صالح أو مستخدم بالفعل", StatusCode.BAD_REQUEST);
  }

  // 3. check expiration
  if (isOtpExpired(otpRecord.expires_at)) {
    await emailVerificationRepo.invalidateOtp(email);
    throw new ApiError(
      "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.",
      StatusCode.BAD_REQUEST,
    );
  }

  // 4. check max attempts
  if (otpRecord.attempts_count >= OTP_MAX_ATTEMPTS) {
    await emailVerificationRepo.invalidateOtp(email);
    throw new ApiError(
      "تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز جديد.",
      StatusCode.TOO_MANY_REQUESTS,
    );
  }

  if (!otpRecord.otp_hash) {
    throw new ApiError("رمز التحقق غير صالح", StatusCode.BAD_REQUEST);
  }

  // 5. verify otp hash
  const otpMatched = await bcrypt.compare(otp, otpRecord.otp_hash);
  if (!otpMatched) {
    await emailVerificationRepo.incrementAttempts(email);
    const remainingAttempts = OTP_MAX_ATTEMPTS - (otpRecord.attempts_count + 1);

    if (remainingAttempts <= 0) {
      await emailVerificationRepo.invalidateOtp(email);
      throw new ApiError(
        "تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى طلب رمز جديد.",
        StatusCode.TOO_MANY_REQUESTS,
      );
    }

    throw new ApiError(
      `رمز التحقق غير صحيح. متبقي ${remainingAttempts} محاولة.`,
      StatusCode.BAD_REQUEST,
    );
  }

  // 6. activate user and consume otp
  await emailVerificationRepo.activateUserAndConsumeOtp(email);

  // 7. sign token and return user data
  const token = signToken(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      verified: true,
      document_status: "pending",
      is_active: false,
      userType: UserType.USER,
    },
    process.env.JWT_EXPIRE_TIME,
  );

  return {
    message:
      "تم تأكيد البريد الإلكتروني بنجاح، جاري مراجعة المستندات من قِبل إدارة المستشفى لتفعيل الحساب",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: "USER",
      verified: true,
      document_status: "pending",
      is_active: false,
    },
  };
};

export const resendVerificationOtp = async (email) => {
  return await sendVerificationOtp(email);
};
