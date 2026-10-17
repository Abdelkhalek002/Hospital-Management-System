import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// IMPORT REPOSITORIES
import Base from "../../repositories/base.repository.js";
import User from "../user/user.repository.js";

// IMPORT SERVICES
import { signToken, verifyToken } from "./jwt.service.js";
import * as emailService from "../../services/email.service.js";
import * as emailVerificationService from "./email-verification/email-verification.service.js";

// IMPORT UTILITIES
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { UserType } from "../../utils/user-types.js";

const checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const signup = async (studentData) => {
  const userRepo = new User();

  //1. check if (email, national_id, phone_number) exist
  const emailExists = await userRepo.existsByField(
    "email",
    studentData.email,
  );
  if (emailExists) throw new ApiError("Email already exists");

  const nationalIdExists = await userRepo.existsByField(
    "national_id",
    String(studentData.national_id),
  );
  if (nationalIdExists) throw new ApiError("National ID already exists");

  const phoneNumberExists = await userRepo.existsByField(
    "phone_number",
    String(studentData.phone_number),
  );
  if (phoneNumberExists)
    throw new ApiError("Phone number already exists", StatusCode.BAD_REQUEST);

  //2. hash password
  const hashedPassword = await bcrypt.hash(studentData.password, 12);

  //3. build final payload
  const finalStudentData = {
    ...studentData,
    password: hashedPassword,
    national_id: String(studentData.national_id),
    user_image_path: studentData.user_profile_photo,
    national_id_path: studentData.national_id_file,
    fees_path: studentData.fees_file,
  };

  //4. create the user (unverified by default)
  const newUser = await userRepo.create(finalStudentData);

  //5. send activation OTP via email
  await emailVerificationService.sendVerificationOtp(finalStudentData.email);

  return {
    newUser,
    email: finalStudentData.email,
    requiresVerification: true,
  };
};

export const login = async (userType, email, password) => {
  // 1. Validate userType
  if (!Object.values(UserType).includes(userType)) {
    throw new ApiError("Invalid user type", StatusCode.BAD_REQUEST);
  }
  // 2. Check email existence
  const user = await new User(userType).findByEmail(email);
  if (!user) throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);

  // 3. Compare passwords
  const matched = await checkPassword(password, user.password);

  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);

  // 4. Verify email verification status for regular users
  if (userType === UserType.USER && !user.verified) {
    throw new ApiError(
      "برجاء تفعيل حسابك أولاً باستخدام رمز التحقق المرسل إلى بريدك الإلكتروني",
      StatusCode.FORBIDDEN,
    );
  }

  // 5. Sign token
  const token = signToken({ ...user, userType }, process.env.JWT_EXPIRE_TIME);
  const result = { user, token };

  // 6. Change status to online
  await new User(userType).setOnline(user.id);

  return result;
};

export const logout = async ({ res, userType, userId, clearCookieOptions }) => {
  res.clearCookie("jwt", clearCookieOptions);
  if (userType && userId) {
    await new User().setOffline(userType, userId);
  }
};

export const protect = async (token) => {
  // 1. verify user from token
  const decoded = await verifyToken(token, process.env.JWT_SECRET);

  // 2. find user by email
  const currentUser = await new User(decoded.type || decoded.userType).findByEmail(decoded.email);
  if (!currentUser || currentUser.length === 0) {
    throw new ApiError(
      "The user that belongs to this token no longer exists",
      StatusCode.UNAUTHORIZED,
    );
  }

  // 3. check if password changed after token was issued
  if (currentUser.password_changed_at) {
    const passChangedTimestamp = Math.floor(
      new Date(currentUser.password_changed_at).getTime() / 1000,
    );
    if (passChangedTimestamp > decoded.iat) {
      throw new ApiError(
        "User recently changed their password. Please Login again.",
        StatusCode.UNAUTHORIZED,
      );
    }
  }
  return currentUser;
};
