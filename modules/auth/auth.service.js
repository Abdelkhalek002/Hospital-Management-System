import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// IMPORT REPOSITORIES
import Base from "../../repositories/base.repository.js";
import Auth from "./auth.repository.js";
import Student from "../../repositories/student.repository.js";
import User from "../../repositories/user.repository.js";

// IMPORT SERVICES
import { signToken } from "./jwt.service.js";
import * as emailService from "../../services/email.service.js";

// IMPORT UTILITIES
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { UserType } from "../../utils/user-types.js";

const checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const signup = async (studentData) => {
  //1. check if (email, national_id, phone_number) existes
  const emailExists = await Base.existsByField(
    "students",
    "email",
    studentData.email,
  );
  if (emailExists) throw new ApiError("Email already exists");

  const nationalIdExists = await new Base().existsByField(
    "students",
    "national_id",
    studentData.national_id,
  );
  if (nationalIdExists) throw new ApiError("National ID already exists");
  const phoneNumberExists = await Base.existsByField(
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
  const newUser = await new Student().create(finalStudentData);

  //5. send activation email
  await emailService.sendActivationMail(finalStudentData);

  //6. create a new token
  const token = signToken(
    { ...newUser, userType: UserType.STUDENT },
    process.env.JWT_EXPIRE_TIME,
  );

  // 7. Change status to online
  //await User.setOnline(UserType.STUDENT, newUser.id);
  const result = { newUser, token };

  return result;
};

export const performLogin = async (userType, email, password) => {
  // 1. Validate userType
  if (!Object.values(UserType).includes(userType)) {
    throw new ApiError("Invalid user type", StatusCode.BAD_REQUEST);
  }
  // 2. Check email existence
  const user = await new Auth().findByEmailForAuth(userType, email);
  if (!user) throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);

  // 3. Compare passwords
  const matched = await checkPassword(password, user.password);
  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);

  // 4. Sign token
  const token = signToken({ ...user, userType }, process.env.JWT_EXPIRE_TIME);
  const result = { user, token };

  // 5. Change status to online
  await new User().setOnline(userType, user.id);

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
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 2. find user by email
  const currentUser = await new Auth().findByEmailForAuth(
    decoded.userType,
    decoded.email,
  );
  if (!currentUser || currentUser.length === 0) {
    return next(
      new ApiError("The user that belongs to this token no longer exists", 401),
    );
  }
  // 3. check if password changed after token was issued
  if (currentUser.password_changed_at) {
    const passChangedTimestamp = Math.floor(
      new Date(currentUser.password_changed_at).getTime() / 1000,
    );
    if (passChangedTimestamp > decoded.iat) {
      return res.status(401).json({
        status: "error",
        message: "User recently changed their password. Please Login again.",
      });
    }
  }
  return currentUser;
};
