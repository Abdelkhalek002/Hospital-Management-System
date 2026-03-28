// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import pool from "../../config/db.js";
import * as authService from "./services/auth.service.js";
import { roles } from "../../utils/roles.js";
import { StatusCode } from "../../utils/status-codes.js";
import { UserType } from "../../utils/user-types.js";
import dotenv from "dotenv";
import ApiError from "../../utils/api-error.js";
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

const getCookieOptions = (req) => ({
  maxAge: Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  sameSite: "lax",
});

const getClearCookieOptions = (req) => {
  const cookieOptions = getCookieOptions(req);
  return {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  };
};

export const signup = asyncHandler(async (req, res) => {
  const studentData = pick(req.body, allowedFields);
  const data = await authService.signup(studentData);
  res.cookie("jwt", data.token, getCookieOptions(req));
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
  let loginFn;

  const studentLogin = async (email, password) =>
    await authService.performLogin(UserType.STUDENT, email, password);

  const adminLogin = async (email, password) =>
    await authService.performLogin(UserType.ADMIN, email, password);

  const superAdminLogin = async (email, password) =>
    await authService.performLogin(UserType.SUPER_ADMIN, email, password);

  if (!email || !password) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      error: "برجاء كتابة الايميل وكلمة المرور",
    });
  }

  if (email.endsWith("@hsh.io")) {
    loginFn = superAdminLogin;
  } else if (email.includes("@admin.com")) {
    loginFn = adminLogin;
  } else if (email.endsWith("@fci.helwan.edu.eg")) {
    loginFn = studentLogin;
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

export const logout = asyncHandler(async (req, res) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  let decoded;
  if (token) {
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError("Invalid or expired token", StatusCode.UNAUTHORIZED);
    }
  }
  await authService.logout({
    res,
    userType: decoded?.userType,
    userId: decoded?.id,
    clearCookieOptions: getClearCookieOptions(req),
  });
  return res.status(StatusCode.OK).json({
    success: true,
    message: "Logged out successfully",
  });
});
