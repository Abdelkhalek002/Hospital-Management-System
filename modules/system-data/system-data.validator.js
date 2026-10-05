import { check } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

const createResourceValidator = (fieldNames, label) => [
  check().custom((_, { req }) => {
    const value = fieldNames
      .map((f) => req.body[f])
      .find((v) => v !== undefined && v !== null && String(v).trim() !== "");

    if (!value || typeof value !== "string" || value.trim() === "") {
      throw new Error(`اسم ${label} مطلوب`);
    }

    const trimmed = value.trim();

    if (!customValidators.isArabic(trimmed)) {
      throw new Error(`اسم ${label} يجب أن يكون باللغة العربية`);
    }

    // Normalize value across both camelCase and snake_case on req.body
    fieldNames.forEach((field) => {
      req.body[field] = trimmed;
    });

    return true;
  }),
  handleValidationErrors,
];

// CLINICS VALIDATOR
export const clinicValidator = createResourceValidator(
  ["clinicName", "clinic_name"],
  "العيادة",
);

// EXTERNAL HOSPITALS VALIDATOR
export const hospitalValidator = createResourceValidator(
  ["hospital_name", "hospName"],
  "المستشفى",
);

// FACULTY VALIDATOR
export const facultyValidator = createResourceValidator(
  ["facultyName", "faculty_name"],
  "الكلية",
);

// LEVELS VALIDATOR
export const levelsValidator = createResourceValidator(
  ["levelName", "level_name"],
  "المستوى",
);

// GOVERNORATES VALIDATOR
export const governorateValidator = createResourceValidator(
  ["govName", "gov_name"],
  "المحافظة",
);
