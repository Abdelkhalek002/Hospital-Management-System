// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import * as authService from "./auth.service.js";
import { StatusCode } from "../../utils/status-codes.js";
import { UserType } from "../../utils/user-types.js";
import { pick } from "../../utils/pick-from-body-request.js";
import ApiError from "../../utils/api-error.js";
import { verifyToken } from "./jwt.service.js";
import { matchesDomain } from "../../utils/custom-validators.js";
import { rolePermissions } from "../../utils/permissions.js";


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
  "user_image_path",
  "national_id_file",
  "national_id_path",
  "fees_file",
  "fees_path",
];

export const signup = asyncHandler(async (req, res) => {
  const studentData = pick(req.body, allowedFields);
  const data = await authService.signup(studentData);

  return res.status(StatusCode.CREATED).json({
    status: "success",
    message:
      "تم إنشاء الحساب بنجاح. برجاء تفقد بريدك الإلكتروني لإدخال رمز التحقق لتفعيل الحساب",
    email: data.email,
    requiresVerification: true,
  });
});

//--------------------------------------LOGIN------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let loginFn;

  const userLogin = async (userEmail, userPassword) =>
    await authService.login(UserType.USER, userEmail, userPassword);

  const adminLogin = async (adminEmail, adminPassword) =>
    await authService.login(UserType.ADMIN, adminEmail, adminPassword);

  if (!email || !password) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      error: "برجاء كتابة الايميل وكلمة المرور",
    });
  }

  if (
    matchesDomain(email, process.env.SUPER_ADMIN_EMAIL_DOMAIN) ||
    matchesDomain(email, process.env.ADMIN_EMAIL_DOMAIN)
  ) {
    loginFn = adminLogin;
  } else {
    loginFn = userLogin;
  }

  const { token, user } = (await loginFn(email, password)) || {};
  if (!token) {
    throw new ApiError("Login failed", StatusCode.UNAUTHORIZED);
  }

  res.cookie("jwt", token, getCookieOptions(req));
  return res.status(StatusCode.OK).json({
    success: true,
    token,
    data: {
      id: user?.id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      permissions: rolePermissions[user?.role] || [],
    },
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
      decoded = await verifyToken(token, process.env.JWT_SECRET);
    } catch (error) {
      decoded = jwt.decode(token);
    }
  }

  await authService.logout({
    res,
    userType: decoded?.userType || decoded?.type,
    userId: decoded?.id,
    clearCookieOptions: getClearCookieOptions(req),
  });

  return res.status(StatusCode.OK).json({
    success: true,
    message: "Logged out successfully",
  });
});
