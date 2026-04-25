// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

export const updateMeValidator = [
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

  handleValidationErrors,
];
