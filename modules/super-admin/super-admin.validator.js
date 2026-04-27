// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

export const createAdminValidator = [
  body("username").notEmpty().withMessage("Username is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid")
    .custom(customValidators.isAdminAllowedEmail)
    .withMessage(
      "Please provide standard email domain for adding new super admin",
    ),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long")
    .bail()
    .matches(/^[A-Z][a-z0-9#@$]{7,39}$/)
    .withMessage(
      "Password should start with an uppercase letter and contain at least 8 characters with lowercase letters, numbers, and symbols.",
    ),
  handleValidationErrors,
];
