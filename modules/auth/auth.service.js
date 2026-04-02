import bcrypt from "bcrypt";

// IMPORT REPOSITORIES
import BaseRepo from "../../repositories/base.repository.js";
import AuthRepo from "./auth.repository.js";
import StudentRepo from "../../repositories/student.repository.js";
import UserRepo from "../../repositories/user.repository.js";

// IMPORT SERVICES
import { signToken } from "./services/jwt.service.js";
import * as emailService from "./services/email.service.js";

// IMPORT UTILITIES
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import { UserType } from "../../utils/user-types.js";

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
