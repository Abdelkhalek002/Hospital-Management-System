// IMPORTING DEPENDENCIES
import { check } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

// CLINICS VALIDATOR
export const clinicValidator = [
  check("clinicName")
    .notEmpty()
    .withMessage("Clinic is Required")
    .custom(customValidators.isArabic)
    .withMessage("Clinic must be in arabic format"),
  handleValidationErrors,
];

// EXTERNAL HOSPITALS VALIDATOR
export const hospitalValidator = [
  check("hospName")
    .notEmpty()
    .withMessage("Hospital is Required")
    .custom(customValidators.isArabic)
    .withMessage("Hospital must be in arabic format"),
  handleValidationErrors,
];

// FACULTY VALIDATOR
export const facultyValidator = [
  check("facultyName")
    .notEmpty()
    .withMessage("The Name of Faculty is Required")
    .custom(customValidators.isArabic)
    .withMessage("The Name of Faculty must be in arabic format"),
  handleValidationErrors,
];

// LEVELS VALIDATOR
export const levelsValidator = [
  check("levelName")
    .notEmpty()
    .withMessage("level is required")
    .custom(customValidators.isArabic)
    .withMessage("level must be in arabic format"),
  handleValidationErrors,
];
