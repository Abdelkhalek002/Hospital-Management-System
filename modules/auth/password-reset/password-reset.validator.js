// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../../middlewares/validator.middleware.js";
import * as customValidators from "../../../utils/custom-validators.js";

// FORGET PASSWORD VALIDATOR
export const forgetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("invalid email")
    .custom(customValidators.isAllowedEmail)
    .withMessage("Email format is not allowed!"),
  handleValidationErrors,
];
// RESET PASSWORD VALIDATOR
export const resetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("invalid email"),
  body("OTP")
    .custom(customValidators.otpExist)
    .withMessage("OTP is required")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP should be 6 digits"),
  body("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .bail()
    .matches(/^[A-Z][a-z0-9#@]{7,39}$/)
    .withMessage(
      "Password should start with an uppercase letter and contain 8 to 40 characters with lowercase letters, numbers, or symbols #, @.",
    ),
  handleValidationErrors,
];
