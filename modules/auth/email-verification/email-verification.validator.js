import { body } from "express-validator";
import handleValidationErrors from "../../../middlewares/validator.middleware.js";

export const verifyOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("البريد الإلكتروني مطلوب")
    .bail()
    .isEmail()
    .withMessage("صيغة البريد الإلكتروني غير صحيحة"),
  body("otp")
    .notEmpty()
    .withMessage("رمز التحقق مطلوب")
    .bail()
    .isNumeric()
    .withMessage("رمز التحقق يجب أن يتكون من أرقام فقط")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("رمز التحقق يجب أن يتكون من 6 أرقام"),
  handleValidationErrors,
];

export const resendOtpValidator = [
  body("email")
    .notEmpty()
    .withMessage("البريد الإلكتروني مطلوب")
    .bail()
    .isEmail()
    .withMessage("صيغة البريد الإلكتروني غير صحيحة"),
  handleValidationErrors,
];
