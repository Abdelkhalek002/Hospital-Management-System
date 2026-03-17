// IMPORTING DEPENDENCIES
import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import customValidators from "../../utils/custom-validators.js"; // Ensure you have this module and it is correctly path

export const addNewAdminValidator = [
  check("userName").notEmpty().withMessage("userName is required"),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  check("role").notEmpty().withMessage("role is required"),
  validatorMiddleware,
];

export const addSuperAdminValidator = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  check("role").notEmpty().withMessage("role is required"),
  validatorMiddleware,
];

export const updateAdminValidator = [
  check("userName").notEmpty().withMessage("userName is required"),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is not valid"),
  check("role").notEmpty().withMessage("role is required"),
  validatorMiddleware,
];

export const resetPasswordValidator = [
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),
  validatorMiddleware,
];

export const sendObservationValidator = [
  check("observation")
    .notEmpty()
    .withMessage("Observation is required")
    .isLength({ min: 4 })
    .withMessage("observation must be at least 6 characters long"),
  validatorMiddleware,
];
