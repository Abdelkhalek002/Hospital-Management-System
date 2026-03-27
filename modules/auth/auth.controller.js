// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import pool from "../../config/db.js";
import * as authService from "./services/auth.service.js";
import { roles } from "../../utils/roles.js";
import { StatusCode } from "../../utils/status-codes.js";
import dotenv from "dotenv";
dotenv.config();

//----------------------------------SIGNUP---------------------------------------
const allowedFields = [
  "username",
  "email",
  "password",
  "national_id",
  "nationality_id",
  "level_id",
  "gov_id",
  "faculty_id",
  "gender",
  "birth_date",
  "phone_number",
  "user_image_file",
  "national_id_file",
  "fees_file",
];
const pick = (obj, fields) =>
  fields.reduce((acc, field) => {
    if (obj[field] !== undefined) acc[field] = obj[field];
    return acc;
  }, {});

export const signup = asyncHandler(async (req, res) => {
  const studentData = pick(req.body, allowedFields);
  const data = await authService.signup(studentData);
  res.cookie("jwt", data.token, {
    maxAge: Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
  res.status(StatusCode.OK).json({
    status: "success",
    message:
      "تم عمل البريد الالكتروني بنجاح برجاء تفقد البريد الالكتروني للتفعيل",
    token: data.token,
  });
});

//--------------------------------------LOGIN------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      error: "برجاء كتابة الايميل وكلمة المرور",
    });
  }

  let loginFn;

  if (email.endsWith("@hsh.io")) {
    loginFn = authService.superAdminLogin;
  } else if (email.includes("@admin.com")) {
    loginFn = authService.adminLogin;
  } else if (email.endsWith("@fci.helwan.edu.eg")) {
    loginFn = authService.userLogin;
  } else {
    throw new ApiError("Login failed", StatusCode.UNAUTHORIZED);
  }

  const { token } = (await loginFn(email, password)) || {};

  if (!token) {
    throw new ApiError("Login failed", StatusCode.UNAUTHORIZED);
  }

  return res.status(StatusCode.OK).json({
    success: true,
    token,
  });
});

//--------------------------------------forget Password--------------------------
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, OTP, newPassword } = req.body;

  const sql = "SELECT * FROM students WHERE email = ? AND OTP = ?";
  pool.query(sql, [email, OTP], async (err, result) => {
    if (err) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
    } else {
      if (result.length === 0) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ message: "Invalid OTP" });
      } else {
        const { email } = result[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        pool.query(
          "UPDATE students SET password = ?, OTP = NULL WHERE email = ?",
          [hashedPassword, email],
          (err, result) => {
            if (err) {
              return res.status(StatusCode.INTERNAL_SERVER_ERROR).send(err);
            } else {
              return res
                .status(StatusCode.OK)
                .json({ message: "تم تغيير كلمة السر بنجاح" });
            }
          },
        );
      }
    }
  });
});
