// IMPORTING DEPENDENCIES
import asyncHandler from "express-async-handler";

import * as passwordResetService from "./password-reset.service.js";
import { StatusCode } from "../../../utils/status-codes.js";

//--------------------------------------SEND RESET OTP---------------------------
export const sendPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await passwordResetService.sendPasswordResetOtp(email);

  return res.status(StatusCode.OK).json({
    success: true,
    message: data.message,
  });
});

//--------------------------------------FORGET PASSWORD--------------------------
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, OTP, newPassword } = req.body;

  const data = await passwordResetService.resetPasswordWithOtp({
    email,
    otp: OTP,
    newPassword,
  });

  return res.status(StatusCode.OK).json({
    success: true,
    message: data.message,
  });
});
