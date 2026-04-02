import express from "express";
const router = express.Router();

import * as authController from "./auth.controller.js";
import * as validator from "./auth.validator.js";
import { activateEmail } from "./services/email.service.js";
import {
  uploadRegisterationFiles,
  resizeFiles,
} from "./services/file-upload.service.js";
import limiter from "../../services/rate-limit.service.js";
import { confirmEmail } from "./services/super-admin-email.service.js";

router
  .route("/signUp")
  .post(
    uploadRegisterationFiles,
    resizeFiles,
    validator.validateSignup,
    authController.signup,
  );
router.get("/activate/:token", activateEmail);

router
  .post(
    "/forgetPassword",
    validator.sendOtpValidator,
    limiter,
    authController.sendPasswordResetOtp,
  )
  .post(
    "/resetPassword",
    validator.forgetPasswordValidator,
    authController.resetPassword,
  )
  .post("/login", validator.validateLogin, authController.login)
  .post("/logout", authController.logout);
router.get("/confirmEmail", confirmEmail);

export default router;
