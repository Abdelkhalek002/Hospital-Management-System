import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import BaseRepo from "../../../shared/repositories/base.repository.js";
import AuthRepo from "../repositories/auth.repository.js";
import StudentRepo from "../../../shared/repositories/student.repository.js";
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
  const token = await signToken(newUser);
  const result = { newUser, token };

  return result;
};

export const userLogin = async (email, password) => {
  //1- check email existence
  const authRepo = new AuthRepo();
  const studentRepo = new StudentRepo();
  const candidate = await authRepo.findByEmailForAuth(email);
  if (!candidate)
    throw new ApiError("المستخدم غير موجود", StatusCode.NOT_FOUND);
  //2- compare passwords
  const matched = await checkPassword(candidate.password, password);
  if (!matched)
    throw new ApiError("كلمة المرور غير صحيحة", StatusCode.UNAUTHORIZED);
  //3- sign token
  const token = signToken(candidate);
  const result = { candidate, token };
  //4- change status (online)
  await studentRepo.toggleStatus(candidate.student_id);
  return result;
};
