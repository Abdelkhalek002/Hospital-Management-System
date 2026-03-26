// IMPORTING DEPENDENCIES
import { check } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";

export const updateUserProfileValidator = [
  check("user_image_file").optional(),
  check("phone_number")
    .optional()
    .isNumeric()
    .withMessage("phone number should contain numerical values")
    .isMobilePhone("ar-EG")
    .withMessage("phone number should be in egypt"),
  check("national_id")
    .optional()
    .isNumeric()
    .withMessage("National ID should contain numerical values")
    .isLength({ min: 14, max: 14 })
    .withMessage("National ID must be exactly 14 characters"),
  handleValidationErrors,
];
