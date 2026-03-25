import bcrypt from "bcrypt";
import StudentRepo from "../repositories/student.repository.js";
import { sendActivationMail } from "../services/email.service.js";
import ApiError from "../../../utils/api-error.js";

export const signup = async (studentData) => {
  //1- check if (email, national_id) existes
  const studentRepo = new StudentRepo();
  const emailExists = await studentRepo.existsByField(
    "students",
    "email",
    studentData.email,
  );
  if (emailExists) throw new ApiError("Email already exists");
  const nationalIdExists = await studentRepo.existsByField(
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
  const result = await studentRepo.create(finalStudentData);
  return result;
  //5- send activation email
  //await sendActivationMail(finalStudentData.email, finalStudentData.username);
};
