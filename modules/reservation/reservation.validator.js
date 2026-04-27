// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

//@desc   limit reservations to 50 requests per day
export const isLimitReached = (err, result) => {
  if (err) {
    console.error(`Error checking reservation limit:`, err);
  } else if (result.length >= 20) {
    return true;
  }
  return false;
};

export const createRequestValidator = [
  body("clinic_id").notEmpty().isNumeric(),
  body("date")
    .notEmpty()
    .withMessage("request date is required")
    .custom(customValidators.isValidDate),
  handleValidationErrors,
];
export const updateRequestValidator = [
  body("clinic_id").notEmpty().isNumeric(),
  body("date")
    .notEmpty()
    .withMessage("date for new reservation is required")
    .custom(customValidators.isValidDate),
  body("examType")
    .custom(customValidators.isArabic)
    .isIn(["كشف جديد", "متابعة"])
    .withMessage("error happened in taking exam type data")
    .optional(),
  handleValidationErrors,
];
export const deleteRequestValidator = [
  body("id").isInt().withMessage("invalid student id !"),
  handleValidationErrors,
];
