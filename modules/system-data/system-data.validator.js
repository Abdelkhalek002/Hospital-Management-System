import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";
import ApiError from "../../utils/api-error.js";

const createResourceValidator = (fieldNames, label) => [
  body().custom((_, { req }) => {
    const value = fieldNames
      .map((f) => req.body[f])
      .find((v) => v !== undefined && v !== null && String(v).trim() !== "");

    // Allow updating just is_active on PUT if no name provided
    if (req.method === "PUT" && value === undefined) {
      if (req.body.is_active !== undefined || req.body.isActive !== undefined) {
        return true;
      }
    }

    if (!value || typeof value !== "string" || value.trim() === "") {
      throw new ApiError(`اسم ${label} مطلوب`, 400);
    }

    const trimmed = value.trim();

    if (!customValidators.isArabic(trimmed)) {
      throw new ApiError(`اسم ${label} يجب أن يكون باللغة العربية`, 400);
    }

    // Normalize value across both camelCase and snake_case on req.body
    fieldNames.forEach((field) => {
      req.body[field] = trimmed;
    });

    return true;
  }),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("حالة التفعيل يجب أن تكون true أو false"),
  handleValidationErrors,
];

// CLINICS VALIDATOR
export const clinicValidator = createResourceValidator(
  ["clinic_name", "clinicName"],
  "العيادة",
);

// EXTERNAL HOSPITALS VALIDATOR
export const hospitalValidator = createResourceValidator(
  ["hospital_name", "hospitalName"],
  "المستشفى",
);

// FACULTY VALIDATOR
export const facultyValidator = createResourceValidator(
  ["faculty_name", "facultyName"],
  "الكلية",
);

// LEVELS VALIDATOR
export const levelsValidator = createResourceValidator(
  ["level_name", "levelName"],
  "المستوى",
);

// GOVERNORATES VALIDATOR
export const governorateValidator = createResourceValidator(
  ["gov_name", "govName"],
  "المحافظة",
);
