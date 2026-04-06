// Importing dependencies
import StudentRepo from "../repositories/student.repository.js";

// To check if the code is in Arabic or not
export const isArabic = (value) => {
  return /^[؀-ۿـ\s]+$/u.test(value);
};

// To validate appointment date
export const isValidDate = (value) => {
  const timestamp = new Date(value).getTime();
  return !Number.isNaN(timestamp) || timestamp <= Date.now();
};

// To check if the account is verified
export const isVerified = async (email) => {
  const studentRepo = new StudentRepo();
  return studentRepo.verfied(email);
};

// To validate Helwan University account
export const isAllowedEmail = (value) => {
  return value.split("@")[1].endsWith("fci.helwan.edu.eg");
};

export const isAdminAllowedEmail = (value) => {
  return (
    value.split("@")[1].endsWith("hsh.io") ||
    value.split("@")[1].endsWith("admin.io")
  );
};

export const isAllowedEmailForLogin = (value) => {
  return (
    value.split("@")[1].endsWith("hsh.io") ||
    value.split("@")[1].endsWith("admin.io") ||
    value.split("@")[1].endsWith("fci.helwan.edu.eg")
  );
};

export const otpExist = (_, { req }) => {
  return req.body.OTP || req.body.otp;
};
