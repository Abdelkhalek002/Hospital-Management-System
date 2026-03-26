// IMPORTING DEPENDENCIES
import { body } from "express-validator";
import handleValidationErrors from "../../middlewares/validator.middleware.js";
import * as customValidators from "../../utils/custom-validators.js";

export const addNewAdminValidator = [
  body("userName").notEmpty().withMessage("userName is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  body("role").notEmpty().withMessage("role is required"),
  handleValidationErrors,
];

export const addSuperAdminValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  body("role").notEmpty().withMessage("role is required"),
  handleValidationErrors,
];

export const updateAdminValidator = [
  body("userName").notEmpty().withMessage("userName is required"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  body("role").notEmpty().withMessage("role is required"),
  handleValidationErrors,
];

export const resetPasswordValidator = [
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  handleValidationErrors,
];

export const sendObservationValidator = [
  body("observation")
    .notEmpty()
    .withMessage("Observation is required")
    .isLength({ min: 4 })
    .withMessage("observation must be at least 6 characters long"),
  handleValidationErrors,
];
