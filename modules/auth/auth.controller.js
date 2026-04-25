// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import * as authService from "./auth.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { UserType } from "../../utils/user-types.js";
import { pick } from "../../utils/pick-from-body-request.js";
import ApiError from "../../utils/api-error.js";

dotenv.config();

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

export const signup = asyncHandler(async (req, res) => {
  const studentData = pick(req.body, allowedFields);
  const data = await authService.signup(studentData);

  res.cookie("jwt", data.token, getCookieOptions(req));
  return res.status(StatusCode.CREATED).json({
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

  const studentLogin = async (studentEmail, studentPassword) =>
    await authService.performLogin(
      UserType.STUDENT,
      studentEmail,
      studentPassword,
    );

  const adminLogin = async (adminEmail, adminPassword) =>
    await authService.performLogin(UserType.ADMIN, adminEmail, adminPassword);

  const superAdminLogin = async (superEmail, superPassword) =>
    await authService.performLogin(
      UserType.SUPER_ADMIN,
      superEmail,
      superPassword,
    );

  if (!email || !password) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      error: "برجاء كتابة الايميل وكلمة المرور",
    });
  }

  if (email.endsWith(process.env.SUPER_ADMIN_Email_DOMAIN)) {
    loginFn = superAdminLogin;
  } else if (email.endsWith(process.env.ADMIN_Email_DOMAIN)) {
    loginFn = adminLogin;
  } else if (email.endsWith(process.env.User_Email_DOMAIN)) {
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

//--------------------------------------LOGOUT-----------------------------------
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
