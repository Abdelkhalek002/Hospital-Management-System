// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

export const updateValidator = [
  body("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("gov_id").optional().isNumeric().withMessage("Invalid governorate id"),

  body("birth_date").optional().isDate().withMessage("Invalid date format"),

  body("gender")
    .optional()
    .custom(customValidators.isArabic)
    .withMessage(`Gender format is not in arabic!`)
    .bail()
    .isIn(["ذكر", "أنثي"])
    .withMessage("Invalid gender data"),

  body("user_image_file").optional(),

  body("national_id")
    .optional()
    .isNumeric()
    .isLength({ min: 14, max: 14 })
    .withMessage("national id should contain exactly 14 characters"),

  body("phone_number").optional().isMobilePhone("ar-EG"),

  body("faculty_id").optional().isNumeric().withMessage("Invalid faculty id"),

  body("level_id").optional().isNumeric().withMessage("Invalid level id"),

  body("nationality_id").optional().isNumeric(),

  handleValidationErrors,
];
