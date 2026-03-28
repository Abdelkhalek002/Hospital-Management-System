import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// IMPORT REPOSITORIES
import BaseRepo from "../../../shared/repositories/base.repository.js";
import AuthRepo from "../repositories/auth.repository.js";
import StudentRepo from "../../../shared/repositories/student.repository.js";
import UserRepo from "../../../shared/repositories/user.repository.js";

import { sendActivationMail } from "../services/email.service.js";
import ApiError from "../../../utils/api-error.js";
import { StatusCode } from "../../../utils/status-codes.js";
import { UserType } from "../../../utils/user-types.js";

const signToken = (student) => {
  const id = student.student_id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  student.password = undefined;
  return token;
};

const checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const signup = async (studentData) => {
  //1- check if (email, national_id) existes
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

  //2- hash password
  const hashedPassword = await bcrypt.hash(studentData.password, 12);

  //3- build final payload
  const finalStudentData = {
    ...studentData,
    password: hashedPassword,
  };
  //4- create the student
  const newUser = await studentRepo.create(finalStudentData);

  //5- send activation email
  //await sendActivationMail(finalStudentData.email, finalStudentData.username);

  //6- create a new token
  const token = signToken(newUser);
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
  const token = signToken(user);
  const result = { user, token };
  // 5. Change status to online
  await userRepo.setOnline(userType, user.id);

  return result;
};
