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

export const superAdminLogin = async (email, password) => {
  //1- check email existence
  const authRepo = new AuthRepo();
  const userRepo = new UserRepo();
  const existed = await authRepo.findByEmailForAuth("super_admins", email);
  if (!existed)
    throw new ApiError("Email does not exist", StatusCode.NOT_FOUND);
  //2- compare passwords
  const matched = await checkPassword(password, existed.password);
  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);
  //3- sign token
  const token = signToken(existed);
  const result = { existed, token };
  //4- change status (online)
  await userRepo.setOnline("super_admins", existed.id);
  return result;
};
export const adminLogin = async (email, password) => {
  //1- check email existence
  const authRepo = new AuthRepo();
  const userRepo = new UserRepo();
  const existed = await authRepo.findByEmailForAuth("admins", email);
  if (!existed) throw new ApiError("الأدمن غير موجود", StatusCode.NOT_FOUND);
  //2- compare passwords
  const matched = await checkPassword(password, existed.password);
  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);
  //3- sign token
  const token = signToken(existed);
  const result = { existed, token };
  //4- change status (online)
  await userRepo.setOnline("admins", existed.id);
  return result;
};

export const userLogin = async (email, password) => {
  //1- check email existence
  const authRepo = new AuthRepo();
  const userRepo = new UserRepo();
  const existed = await authRepo.findByEmailForAuth("students", email);

  if (!existed) throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  //2- compare passwords
  const matched = await checkPassword(password, existed.password);
  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);
  //3- sign token
  const token = signToken(existed);
  const result = { existed, token };
  //4- change status (online)
  await userRepo.setOnline("students", "student_id", existed.id);
  return result;
};
