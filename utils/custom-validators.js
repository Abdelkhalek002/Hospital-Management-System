// Importing dependencies
import Student from "../modules/students/student.repository.js";

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
  const Student = new Student();
  return Student.verfied(email);
};

// To validate Helwan University account
export const isAllowedEmail = (value) => {
  return value.split("@")[1].endsWith(process.env.USER_EMAIL_DOMAIN);
};

export const isAdminAllowedEmail = (value) => {
  return (
    value.split("@")[1].endsWith() ||
    value.split("@")[1].endsWith(process.env.ADMIN_DOMAIN)
  );
};

export const isAllowedEmailForLogin = (value) => {
  return (
    value.split("@")[1].endsWith(process.env.SUPER_ADMIN_EMAIL_DOMAIN) ||
    value.split("@")[1].endsWith(process.env.ADMIN_EMAIL_DOMAIN) ||
    value.split("@")[1].endsWith(process.env.USER_EMAIL_DOMAIN)
  );
};

export const otpExist = (_, { req }) => {
  return req.body.OTP || req.body.otp;
};
