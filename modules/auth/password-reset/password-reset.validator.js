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
    .withMessage("invalid email"),
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
  body("password")
    .custom((val, { req }) => {
      const targetPass = val !== undefined ? val : req.body?.newPassword;
      if (!targetPass) {
        throw new Error("password is required");
      }
      if (!/^[A-Z][a-z0-9#@$]{7,39}$/.test(targetPass)) {
        throw new Error(
          "Password should start with an uppercase letter and contain 8 to 40 characters with lowercase letters, numbers, or symbols #, @, $.",
        );
      }
      return true;
    }),
  body("password_confirm")
    .custom((val, { req }) => {
      const confirmVal = val !== undefined ? val : req.body?.passwordConfirm;
      if (!confirmVal || !String(confirmVal).trim()) {
        throw new Error("password_confirm is required");
      }
      const targetPassword = req.body?.password ?? req.body?.newPassword;
      if (confirmVal !== targetPassword) {
        throw new Error("password_confirm does not match password");
      }
      return true;
    }),
  handleValidationErrors,
];
