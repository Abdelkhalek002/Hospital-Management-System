import asyncHandler from "express-async-handler";
import * as emailVerificationService from "./email-verification.service.js";
import { StatusCode } from "../../../utils/status-codes.js";

const getCookieOptions = (req) => ({
  maxAge: Number(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  sameSite: "lax",
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await emailVerificationService.verifyEmailOtp({ email, otp });

  if (result.token) {
    res.cookie("jwt", result.token, getCookieOptions(req));
  }

  return res.status(StatusCode.OK).json({
    status: "success",
    message: result.message,
    token: result.token,
    data: result.user,
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await emailVerificationService.resendVerificationOtp(email);

  return res.status(StatusCode.OK).json({
    status: "success",
    message: result.message,
    email: result.email,
  });
});
