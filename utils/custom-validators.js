// Importing dependencies
import StudentRepo from "../shared/repositories/student.repository.js";
import ApiError from "./api-error.js";
import { StatusCode } from "./status-codes.js";

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
  // return new Promise((resolve, reject) => {
  //   const sql = "SELECT verified FROM students WHERE email = ?";
  //   db.query(sql, [email], (err, result) => {
  //     if (err) {
  //       reject(err);
  //     } else {
  //       if (result.length === 0 || result[0].verified === 0) {
  //         reject(
  //           new Error(
  //             "Account is not activated. Please activate your account.",
  //           ),
  //         );
  //       } else {
  //         resolve(true);
  //       }
  //     }
  //   });
  // });
  const studentRepo = new StudentRepo();
  return studentRepo.verfied(email);
};

// To validate Helwan University account
export const isAllowedEmail = (value) => {
  return (
    value.split("@")[1].endsWith("fci.helwan.edu.eg") ||
    value.split("@")[1].endsWith("hsh.io") ||
    value.split("@")[1].endsWith("admin.com")
  );
};
