// IMPORTING DEPENDENCIES
import { body, check } from "express-validator";
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
    .bail()
    .isEmail()
    .withMessage("invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 8 })
    .withMessage("password should be 8 characters at least")
    .bail()
    .matches(/^[A-Z][a-z0-9#@$]{7,39}$/)
    .withMessage(
      "Password should start with an uppercase letter and contain 8 to 40 characters with lowercase letters, numbers, or symbols #, @.",
    ),
  body("national_id")
    .notEmpty()
    .withMessage("national id required")
    .isNumeric()
    .withMessage("only numeric values for national id")
    .isLength({ min: 14, max: 14 })
    .withMessage("national id should contain exactly 14 characters"),
  body("nationality_id").notEmpty().isNumeric(),
  body("level_id").notEmpty().isNumeric(),
  body("gov_id").notEmpty().isNumeric(),
  body("faculty_id").notEmpty().isNumeric(),
  body("gender")
    .notEmpty()
    .withMessage("gender required")
    .customSanitizer((val) => (val === "أنثى" ? "أنثي" : val))
    .custom(customValidators.isArabic)
    .withMessage(`Gender format is not in Arabic!`)
    .isIn(["ذكر", "أنثي"])
    .withMessage("Gender must be either ذكر or أنثي"),
  body("birth_date")
    .notEmpty()
    .withMessage("birth date is required")
    .isDate()
    .withMessage("birth date must be a valid date (YYYY-MM-DD)"),
  body("phone_number")
    .notEmpty()
    .withMessage("phone number required")
    .isMobilePhone("ar-EG"),
  check("user_image_file").custom((_, { req }) => {
    const hasFile =
      req.files?.user_image_file?.[0] || req.body?.user_image_file;
    if (!hasFile) {
      throw new Error("user profile photo is required");
    }
    return true;
  }),
  check("national_id_file").custom((_, { req }) => {
    const hasFile =
      req.files?.national_id_file?.[0] || req.body?.national_id_file;
    if (!hasFile) {
      throw new Error("national id file is required");
    }
    return true;
  }),
  check("fees_file").custom((_, { req }) => {
    const hasFile = req.files?.fees_file?.[0] || req.body?.fees_file;
    if (!hasFile) {
      throw new Error("fees file is required");
    }
    return true;
  }),

  handleValidationErrors,
];

// LOGIN VALIDATOR
export const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("invalid email"),
  body("password").notEmpty().withMessage("password is required").bail(),
  handleValidationErrors,
];
