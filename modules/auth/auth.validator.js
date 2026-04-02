// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

export const validateSignup = [
  body("username")
    .notEmpty()
    .withMessage("user name required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .custom(customValidators.isAllowedEmail)
    .withMessage("Email format is not allowed!"),
  body("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("password should be 8 characters at least")
    .bail()
    .matches(/^[A-Z][a-z0-9#@]{7,39}$/)
    .withMessage(
      "Password should start with an uppercase letter and contain 8 to 40 characters with lowercase letters, numbers, or symbols #, @.",
    ),
  body("national_id")
    .notEmpty()
    .withMessage("national id required")
    .isLength({ min: 14, max: 14 })
    .withMessage("national id should contain exactly 14 characters"),
  body("nationality_id").notEmpty().isNumeric(),
  body("level_id").notEmpty().isNumeric(),
  body("gov_id").notEmpty().isNumeric(),
  body("faculty_id").notEmpty().isNumeric(),
  body("gender")
    .notEmpty()
    .withMessage("gender required")
    .custom(customValidators.isArabic)
    .withMessage(`Gender format is not in Arabic!`)
    .isIn("ذكر", "أنثي"),
  body("birth_date").isDate(),
  body("phone_number")
    .notEmpty()
    .withMessage("phone number required")
    .isMobilePhone("ar-EG"),
  body("user_image_file")
    .notEmpty()
    .withMessage("user profile photo is required"),
  body("national_id_file")
    .notEmpty()
    .withMessage("national id file is required"),
  body("fees_file").notEmpty().withMessage("fees file is required"),

  handleValidationErrors,
];

// LOGIN VALIDATOR
export const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("invalid email")
    .custom(customValidators.isAllowedEmail)
    .withMessage("Email format is not allowed!"),
  body("password").notEmpty().withMessage("password is required").bail(),
  handleValidationErrors,
];
