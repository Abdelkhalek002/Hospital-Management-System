import express from "express";
const router = express.Router();

import * as authController from "./auth.controller.js";
import * as authValidator from "./auth.validator.js";
import * as passwordResetController from "./password-reset/password-reset.controller.js";
import * as passwordResetValidator from "./password-reset/password-reset.validator.js";

import {
  uploadRegisterationFiles,
  resizeFiles,
} from "../../middlewares/file-upload.service.js";
import { activateEmail, confirmEmail } from "./services/email.service.js";
import limiter from "../../services/rate-limit.service.js";

router
  .route("/signUp")
  .post(
    uploadRegisterationFiles,
    resizeFiles,
    authValidator.validateSignup,
    authController.signup,
  );
router.get("/activate/:token", activateEmail);

router
  .post(
    "/forgetPassword",
    passwordResetValidator.forgetPasswordValidator,
    limiter,
    passwordResetController.sendPasswordResetOtp,
  )
  .post(
    "/resetPassword",
    passwordResetValidator.resetPasswordValidator,
    passwordResetController.resetPassword,
  )
  .post("/login", authValidator.validateLogin, authController.login)
  .post("/logout", authController.logout);
router.get("/confirmEmail/:token", confirmEmail);

export default router;
