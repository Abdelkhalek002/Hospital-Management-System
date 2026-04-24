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
  check("hospital_name")
    .optional()
    .custom(customValidators.isArabic)
    .withMessage("Hospital must be in arabic format"),
  check("hospName")
    .optional()
    .custom(customValidators.isArabic)
    .withMessage("Hospital must be in arabic format"),
  check("hospital_name").custom((_, { req }) => {
    const hospital_name = req.body.hospital_name ?? req.body.hospName;
    if (!hospital_name) throw new Error("Hospital is Required");
    req.body.hospital_name = hospital_name;
    return true;
  }),
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
