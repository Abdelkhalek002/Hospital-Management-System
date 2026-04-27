import express from "express";

import * as authController from "./auth.controller.js";
import * as authValidator from "./auth.validator.js";
import * as passwordResetController from "./password-reset/password-reset.controller.js";
import * as passwordResetValidator from "./password-reset/password-reset.validator.js";
import * as fileUploader from "../../middlewares/file-upload.middleware.js";
import * as emailService from "../../services/email.service.js";
import limiter from "../../services/rate-limit.service.js";

const router = express.Router();

router
  .route("/signup")
  .post(
    authValidator.validateSignup,
    fileUploader.uploadRegistrationFiles,
    fileUploader.resizeFiles,
    authController.signup,
  );

router.get("/activate/:token", emailService.activateEmail);

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

router.get("/confirmEmail/:token", emailService.confirmEmail);

export default router;
