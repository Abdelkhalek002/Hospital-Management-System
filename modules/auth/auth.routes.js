import express from "express";
const router = express.Router();

import * as authController from "./auth.controller.js";
import * as validator from "./auth.validator.js";
import { activateEmail } from "./services/email.service.js";
import {
  uploadRegisterationFiles,
  resizeFiles,
} from "./services/file-upload.service.js";
import { sendOtp } from "./services/otp.service.js";
import limiter from "../../shared/services/rate-limit.service.js";
import { confirmEmail } from "./services/super-admin-email.service.js";
import {
  Protect,
  allowedTo,
  allowedToUser,
} from "../../middlewares/auth.middleware.js";
import { roles } from "../../utils/roles.js";

router
  .route("/signUp")
  .post(
    uploadRegisterationFiles,
    resizeFiles,
    validator.validateSignup,
    authController.signup,
  );
router.get(
  "/activate/:token",
  activateEmail,
  //testEmail,
);

router
  .post("/sendOtp", validator.sendOtpValidator, limiter, sendOtp)
  .post(
    "/forgetPassword",
    validator.forgetPasswordValidator,
    authController.forgetPassword,
  )
  .post("/login", validator.validateLogin, authController.login)
  .post("/logout", authController.logout);
router.get("/confirmEmail", confirmEmail);

export default router;
