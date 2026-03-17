import express from "express";
const router = express.Router();

import * as authController from "./auth.controller.js";

// Import services
import { activateEmail } from "./services/activate-user-email.service.js";
import {
  uploadRegisterationFiles,
  resizeFiles,
} from "./services/file-upload.service.js";

// Import validators
import {
  signupValidator,
  sendOtpValidator,
  forgetPasswordValidator,
} from "./auth.validator.js";
import { sendOtp } from "./services/otp.service.js";
import limiter from "../../services/rate-limit.service.js";
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
    signupValidator,
    authController.signup,
  );
router.get("/activate", activateEmail);

router
  .post("/sendOtp", sendOtpValidator, limiter, sendOtp)
  .post(
    "/forgetPassword",
    forgetPasswordValidator,
    authController.forgetPassword,
  )
  .post("/login", authController.login);
router.get("/confirmEmail", confirmEmail);

export default router;
